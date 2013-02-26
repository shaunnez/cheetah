define([
    "jquery",
    "underscore",
    "backbone",
    "models/user",
    "views/splashscreen",
    "views/home",
    "views/nav",
    "views/right-sidebar",
    "views/content",
], function ($, _, Backbone, User, SplashScreenView, HomeView, NavView, RightSidebarView, ContentView) {

    //var app = {}; replace before live, nice having access to app likethis
    app = {};

    BackboneEvt = _.extend({}, Backbone.Events)

    // initialize facebook sdk, plugins, backbone views and socket.io
    app.initialize = function () {
        FB.init({ appId: fbAppId, channelUrl: '/channel.html', status: true, cookie: true, xfbml: true });
        bootbox.setIcons({ "OK": "icon-ok icon-white", "CANCEL": "icon-ban-circle", "CONFIRM": "icon-ok-sign icon-white" });
        //http://bootboxjs.com/documentation.html
        app.initializeViews();
        app.initializeSocket();
    },

    // load the main views
    app.initializeViews = function () {
        app.splashScreenView = new SplashScreenView({ el: "#splashscreen" });
        app.homeView = new HomeView({ el: "#content", app: app });
        app.navView = new NavView({ el: "#navbar", app: app });
        app.rightSidebarView = new RightSidebarView({ el: "#rightcontent", app: app });
    }

    // initialize socketio and setup handlers
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

    // global method - used by twitter and google popup windows - reloads the users session
    windowAuth = function (result) {
        if (result.indexOf("success") > -1) {
            app.socket.emit('reloadsession', {}, function (data) {
                app.user = new User(data);
                authenticate();
            });
        } else {
            bootbox.alert("There was an error connecting to your social account at this time");
        }
    }

    // authenticate check the user and adjust main views accordingly
    var authenticate = function () {
        console.log('authenticated', app.user.authenticated());
        // just change the splash screen text 
        $("#welcome h1").text("all done!")
        // fadeing and onwards to the next view
        setTimeout(function () {
            $("#splashscreen").fadeOut(function () {
                $("#navbar, #content").fadeIn();
                $("#splashscreen").addClass("exclude-menu");
                if (app.user.authenticated()) {
                    app.homeView.stopListening(BackboneEvt);  // todo: remove this?
                    // updates menu and other parts of app
                    BackboneEvt.trigger("user:authenticated");
                    // overwrites home with main content view
                    app.contentView = new ContentView({ el: "#home-container" });
                } else {
                    if (app.user.has("_id")) {
                        BackboneEvt.trigger("user:loaded");
                    }
                }
            });
        }, 500);
        // load content view on authentication
        BackboneEvt.on("user:authenticated", function () {
            app.homeView.stopListening(BackboneEvt);    // todo: remove this?
            app.contentView = new ContentView({ el: "#home-container" });
        })
    }

    return app;

});
