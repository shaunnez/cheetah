define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/content/home.html",
    "text!templates/content/about.html",
    "text!templates/content/contact.html",
    "text!templates/content/faq.html",
], function ($, _, Backbone, HomeTemplate, AboutTemplate, ContactTemplate, FaqTemplate) {
    // http://talkslab.github.com/metro-bootstrap/components.html
    // http://wbpreview.com/previews/WB08J69X2/blog-single.html

    var Home = Backbone.View.extend({

        homeTemplate    : _.template(HomeTemplate),
        aboutTemplate   : _.template(AboutTemplate),
        contactTemplate : _.template(ContactTemplate),
        faqTemplate     : _.template(FaqTemplate),

        events: {
			'click #btnLogin'       : 'emailLogin',
			'click #btnJoin'        : 'register',
			'click #btnTwitter'     : 'twitterLogin',
			'click #btnGoogle'      : 'googleLogin',
            'click #btnFacebook'    : 'facebookLogin',
			'keyup .validate'       : 'validate',
			'blur .validate'        : 'validate',
        },

        initialize: function (options) {
            this.app = options.app || {};
            this.$el.find("#txtRegisterDateOfBirth").datepicker({ format: "dd/mm/yyyy", weekStart: 1 })
            this.$el.find("#ddlRegisterGender").select2();
            this.render();
            this.modelBinder = new Backbone.ModelBinder();
            this.initializeListeners();
        },

        initializeListeners: function () {
            var me = this;
            this.listenTo(BackboneEvt, "user:loaded", function () {
                me.modelBinder.bind(me.app.user, me.el);
                me.validateAll();
                $.pnotify({
                    title: "Great!", text: "Now we just need to capture a few more details in the registration form", type: "success", opacity: 0.8
                });
            })
        },

        render: function () {
            this.$el.find("#home-container").html(this.homeTemplate());
            this.$el.find("#about-container").html(this.aboutTemplate());
            this.$el.find("#faq-container").html(this.faqTemplate());
            this.$el.find("#contact-container").html(this.contactTemplate());
            return this;
        },

        emailLogin: function () {
		    var email = this.$el.find("#txtLoginEmail").val();
		    var password = this.$el.find("#txtLoginPassword").val();
		    var me = this;
		    if (email.length < 4) {
		        $.pnotify({
		            title: "Oh oh...", text: "That didn't work, are you sure you entered your details in correctly?", type: "error", opacity: 0.8
		        });
		    } else if (password.length == 0) {
		        $.pnotify({
		            title: "No password", text: "Your password must be 6 characters long!", type: "info", opacity: 0.8
		        });
		    } else {
		        me.app.socket.emit("login", { "email": email, "password": password }, function (result) {
		            if (result.success == true) {
		                me.app.user.set(result.data);
		                console.log('authenticated', app.user.authenticated());
		                BackboneEvt.trigger("user:authenticated", me.app.user);
		            } else {
		                alert(result.message);
		            }
		        })
		    }
        },

        register: function () {
            this.validateAll();
            var errorCount = this.$el.find('.control-group.error').length > 0;
			var terms = this.$el.find('#chbTerms');
			if (terms.is(':checked') == false) {
			    $.pnotify({
			        title: "Oh oh...", text: "You must agree to our terms and conditions before registering!", type: "error", opacity: 0.8
			    });
			} else if (errorCount > 0) {
			    var errors = this.$el.find('.control-group.error').length;
			    $.pnotify({
			        title: "Oh oh...", text: "There are " + errors + " errors you have to fix!", type: "error", opacity: 0.8
			    });
			} else {
				var data = {
					firstname 	: this.$el.find('#txtRegisterFirstName').val(),
					lastname	: this.$el.find('#txtRegisterLastName').val(),
					gender		: this.$el.find('#ddlRegisterGender').val(),
					email		: this.$el.find('#txtRegisterEmail').val(),
					password	: this.$el.find('#txtRegisterPassword').val()
				}
				var dob = moment(this.$el.find('#txtRegisterDateOfBirth').val(), "DD/MM/YYYY");
				if (dob && dob.isValid()) {
				    data.dateOfBirth = dob.toDate().getTime();
				}
				var me = this;
				me.app.socket.emit("register", data, function (result) {
				    if (result.success == true) {
				        me.app.user.set(result.data);
				        console.log('authenticated', app.user.authenticated());
				        BackboneEvt.trigger("user:authenticated", me.app.user);
					} else {
				        $.pnotify({
				            title: "No password", text: "There was a problem: " + result.message, type: "info", opacity: 0.8
				        });
					}
				})
            }
        },

		twitterLogin: function () {
		    var w = (screen.width / 2) - 180;
		    var h = screen.height - 300;
		    var x = (screen.width / 2) - (w / 2);
		    var y = (screen.height / 2) - (h / 2);
		    return window.open("/auth/twitter", "_blank", "menubar=no,toolbar=no,status=no,width=" + w + ",height=" + h + ",toolbar=no,left=" + x + ",top=" + y);
		},
		
		googleLogin: function () {
		    var w = (screen.width / 2) - 180;
		    var h = screen.height - 300;
		    var x = (screen.width / 2) - (w / 2);
		    var y = (screen.height / 2) - (h / 2);
		    return window.open("/auth/google", "_blank", "menubar=no,toolbar=no,status=no,width=" + w + ",height=" + h + ",toolbar=no,left=" + x + ",top=" + y);
		},

        facebookLogin: function () {
            var me = this;
            FB.login(function (response) {
                if (response.authResponse) {
                    me.loadFacebookDetails(response.authResponse);
                }
            }, { scope: 'email' });
        },

        facebookLoginStatus: function () {
            var me = this;
            FB.getLoginStatus(function (response) {
                if (response.authResponse && response.status === 'connected') {
                    me.loadFacebookDetails(response.authResponse);
                } else {
                    me.$el.find("#btnFacebook").fadeIn();
                }
            });
        },

        loadFacebookDetails: function (options) {
            var me = this;
            // loaded fb details
            FB.api('/me', function (data) {
                if (!data.error) {
                    me.app.socket.emit("facebook", data, function (result) {
                        if (result.success) {
                            me.app.user.set(result.data);
                            if (me.app.user.authenticated())
                                BackboneEvt.trigger("user:authenticated", me.app.user);
                            else
                                BackboneEvt.trigger("user:loaded");
                        } else {
                            $.pnotify({
                                title: "Hmmm...", text: "There was a problem: " + result.message + "", type: "error", opacity: 0.8
                            });
                        }
                    })
                } else {
                    $.pnotify({
                        title: "Hmmm...", text: "There was a problem: " + data.error.message + "", type: "error", opacity: 0.8
                    });
                }
            });
        },

		validate: function(el) {
			var elm = $(el.currentTarget);
			var controlGroup = elm.closest(".control-group");
			var id = elm.attr("id");
			var type = elm.attr('type');
			var val = elm.val();
			var isChecked = elm.attr('checked') == 'checked';
			var errorLabel = elm.closest(".control-group").find(".label-info");
			controlGroup.removeClass('error');
			errorLabel.text("")
			if(type == "email") { 
				if(val.length < 3) {
					controlGroup.addClass('error');
					errorLabel.text("Minimum length is 3!")
				} else if(val.indexOf("@") == -1 || val.indexOf(".") == -1){
					controlGroup.addClass('error');
					errorLabel.text("Invalid email address")
				}
			} else if (type == "password") {
			    this.$el.find('.password-control-group').each(function () {
			        $(this).removeClass('error');
			        $(this).find(".label-info").text("")
			    });
				var password = this.$el.find("#txtRegisterPassword");
				var confirm = this.$el.find("#txtRegisterConfirmPassword");
				var passwordControlGroup = this.$el.find('.password-control-group');
				if (val.length < 6) {
				    this.$el.find('.password-control-group').each(function () {
				        $(this).addClass('error');
				        $(this).find(".label-info").text("Minimum length is 6")
				    });
				} else if(password.val() != confirm.val()) {
					this.$el.find('.password-control-group').each(function() { 
						$(this).addClass('error');
						$(this).find(".label-info").text("Passwords don't match")
					});
				} 
			} else if(val.length < 3) {
				controlGroup.addClass('error');
				errorLabel.text("More than 3 characters...")
			}
		},

		validateAll: function () {
		    this.$el.find('.validate').each(function () {
		        $(this).trigger('keyup');
		    })
		}

    });

    return Home;
});
