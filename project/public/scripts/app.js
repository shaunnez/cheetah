define([
    "jquery",
    "underscore",
    "backbone",
    /*"views/header",
    "views/menu",
    "views/toppanel",
    "views/content",*/
], function ($, _, Backbone) {// HeaderView, MenuView, TopPanelView, ContentView) {
 
    app = {};

    BackboneEvt = _.extend({}, Backbone.Events)

    app.initialize = function () {
        app.loading = $("#loading");
        app.initializeViews();
        app.initializeSocket();
    },

    app.initializeViews = function () {
        /*FB.init({ appId: fbAppId, channelUrl: '/channel.html', status: true, cookie: true, xfbml: true });
        app.headerView = new HeaderView({ el: "#header" });
        app.menuView = new MenuView({ el: "#menu" });
        app.topPanelView = new TopPanelView({ el: "#toppanel" });
        app.contentView = new ContentView({ el: "#content" });
        app.loading.fadeOut();*/
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
