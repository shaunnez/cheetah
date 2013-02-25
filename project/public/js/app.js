define([
    "jquery",
    "underscore",
    "backbone",
    "models/user",
    "views/home",
    "views/nav"
], function ($, _, Backbone, User, HomeView, NavView) {

    //var app = {}; replace before live, nice having access to app likethis
    app = {};

    BackboneEvt = _.extend({}, Backbone.Events)

    app.initialize = function () {
        bootbox.setIcons({ "OK": "icon-ok icon-white", "CANCEL": "icon-ban-circle", "CONFIRM": "icon-ok-sign icon-white" });
        //http://bootboxjs.com/documentation.html
        app.loading = $("#loading");
        app.initializeViews();
        app.initializeSocket();
    },

    app.initializeViews = function () {
        FB.init({ appId: fbAppId, channelUrl: '/channel.html', status: true, cookie: true, xfbml: true });
        //app.loading.fadeOut();
        app.homeView = new HomeView({ el: "#leftcontent", app: app });
        app.navView = new NavView({ el: "#navbar", app: app });
    }

    app.initializeSocket = function () {
        var socket = io.connect();
        socket = io.connect(server);
        app.socket = socket;
        app.socket.on('connected', function (user) {
            app.user = new User(user);
            authenticate();
        });
        app.socket.on('new user', function (data) {
            console.log("new user connected", data)
            $("#message").append("<p>" + data + "</p>");
        })
    }

    // used by popup window
    windowAuth = function (result) {
        if (result.indexOf("success") > -1) {
            app.socket.emit('reloadsession', {}, function (data) {
                app.user = new User(data);
                authenticate();
            });
        } else {
            bootbox.alert("There was an error connecting to your twitter account at this time");
        }
    }

    var authenticate = function () {
        console.log('authenticated', app.user.authenticated());
        if (app.user.authenticated()) {
            BackboneEvt.trigger("user:authenticated");
            $("#welcome h1").text("all done!")
            // load different view....
            /*socket.emit('ready', {}, function (data) {
                console.log('connected to socket', data)
            })*/
        } else {
            $("#splashscreen").fadeOut(function () {
                $("#navbar, #content").fadeIn()
                if (app.user.has("_id")) {
                    BackboneEvt.trigger("user:loaded");
                }
            });
        }
    }
    return app;

});
