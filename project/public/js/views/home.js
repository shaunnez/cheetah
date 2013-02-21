define([
    "jquery",
    "underscore",
    "backbone"
], function ($, _, Backbone) {

    var Home = Backbone.View.extend({

        events: {
            
        },

        initialize: function (options) {
            this.user = options.user || app.user;
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

        loginForm: function () {
            var username = this.$el.find("#email").val();
            var password = this.$el.find("#pwd").val();
            var me = this;
            this.login(username, password, function (data) {
                me.user = data;
            })
        },

        registerForm: function () {
            var email = this.$el.find("#emailReg").val();
            var emailConfirm = this.$el.find("#emailRegConfirm").val();
            if (email.length > 5 && email.indexOf("@") > -1 && email == emailConfirm) {
                this.register(email);
            }
        },

        register: function (email) {
            var me = this;
            $.post("/api/register", { "email": email }, function (data) {
                if (data.success) {
                    me.user = new User(data.data);
                    me.loadPanelData();
                } else {
                    alert(data.message);
                }
            })
        },

        login: function (username, password, callback) {
            var me = this;
            $.post("/api/login", { "username": username, "password": password }, function (data) {
                if (data.success) {
                    me.user = new User(data.data);
                    me.loadPanelData();
                } else {
                    alert(data.message)
                }
                callback(data);
            })
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

    });

    return Home;
});
