define([
    "jquery",
    "underscore",
    "backbone",
    "views/home",
], function ($, _, Backbone, HomeView) {
 
    app = {};

    BackboneEvt = _.extend({}, Backbone.Events)

    app.initialize = function () {
        app.loading = $("#loading");
        app.initializeViews();
        app.initializeSocket();
    },

    app.initializeViews = function () {
        /*
        FB.init({ appId: fbAppId, channelUrl: '/channel.html', status: true, cookie: true, xfbml: true });
        app.loading.fadeOut();
        */
        app.homeView = new HomeView({ el: "#leftcontent" });
    }

    app.initializeSocket = function () {
        var socket = io.connect();
        socket = io.connect(server);
        app.socket = socket;
        app.socket.on('connected', function (user) {
            console.log('connected', user);
            app.user = user;
            socket.emit('ready', {}, function (data) {
                console.log('connected to socket', data)
            })
        });

        app.socket.on('new user', function (data) {
            console.log("new user connected", data)
            $("#message").append("<p>" + data + "</p>");
        })

    }

    return app;

});
