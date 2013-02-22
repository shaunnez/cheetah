define([
    "jquery",
    "underscore",
    "backbone"
], function ($, _, Backbone) {
	// http://talkslab.github.com/metro-bootstrap/components.html
	// http://wbpreview.com/previews/WB08J69X2/blog-single.html
    var Home = Backbone.View.extend({

        events: {
			'click #btnLogin' : 'emailLogin',
			'click #btnJoin' : 'register',
			'click #btnTwitter' : 'twitterLogin',
            'click #btnFacebook' : 'facebookLogin',
			'keyup .validate' : 'validate',
			'blur .validate' : 'validate',
        },

        initialize: function (options) {
            this.user = options.user || app.user;
			this.$el.find("select").select2();
        },


		emailLogin: function () {
	        var username = this.$el.find("#email").val();
            var password = this.$el.find("#pwd").val();
            var me = this;
			var me = this;
            $.post("/api/login", { "username": username, "password": password }, function (data) {
                if (data.success) {
                    me.user = new User(data.data);
                    me.loadPanelData();
                } else {
                    alert(data.message)
                }
            })
        },

		register: function () {
			
			var terms = this.$el.find('#chbTerms');
			if(terms.is(':checked') == false) {
				alert("You must agree to our terms and conditions before registering!")
			} else if(this.$el.find('.control-group.error').length > 0) {
				alert("There are " + this.$el.find('.control-group.error').length + " errors you have to fix!")
			} else {
				var data = {
					firstname 	: this.$el.find('#txtRegisterFirstName').val(),
					lastname	: this.$el.find('#txtRegisterLastName').val(),
					age			: this.$el.find('#txtRegisterAge').val(),
					gender		: this.$el.find('#ddlGender').val(),
					email		: this.$el.find('#txtRegisterEmail').val(),
					password	: this.$el.find('#txtRegisterPassword').val()
				}
				var me = this;
				app.socket.emit("register", data, function(result) {
					if (data.success) {
						me.user = new User(data.data);
					} else {
						alert(data.message);
					}
				})
				/*
	            $.post("/api/register", data, function (data) {
	                if (data.success) {
	                    me.user = new User(data.data);
	                } else {
						alert(data.message);
	                }
	            })*/
            }
        },

		twitterLogin: function() {
			// TO DO
		},
		
        facebookLogin: function () {
            var me = this;
            FB.login(function (response) {
                if (response.authResponse) {
                    me.loadFacebookDetails(response.authResponse);
                }
            });
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
            FB.api('/me', function (response) {
                // login
                me.login(response.username, options.userID, function (data) {
                    console.log(options, data);
                    if (data.success == false) {
                        me.user.save({
                            username: response.username,
                            firstname: response.first_name,
                            surname: response.last_name,
                            facebookId: response.id,
                            gender: response.gender,
                            password: options.userID
                        });
                    }
                });
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
			
			this.$el.find('.password-control-group').each(function() { 
				$(this).removeClass('error');
				$(this).find(".label-info").text("")
			});
			if(type == "email") { 
				if(val.length < 3) {
					controlGroup.addClass('error');
					errorLabel.text("Minimum length is 3!")
				} else if(val.indexOf("@") == -1 || val.indexOf(".") == -1){
					controlGroup.addClass('error');
					errorLabel.text("Invalid email address")
				}
			} else if(type == "password") {
				var password = this.$el.find("#txtRegisterPassword");
				var confirm = this.$el.find("#txtRegisterConfirmPassword");
				var passwordControlGroup = this.$el.find('.password-control-group');
				if(val.length < 6) {
					controlGroup.addClass('error');
					errorLabel.text("Minimum length is 6!")
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
		}

    });

    return Home;
});
