require.config({

    deps: ["main"],

    paths: {
        libs: "../scripts/libs",
        jquery: "../scripts/libs/jquery",
        jqueryui: "../scripts/libs/jqueryui",
        underscore: "../scripts/libs/underscore-min",
        backbone: "../scripts/libs/backbone",
        text: "../scripts/libs/text",
        foundation: "../scripts/libs/foundation.min",
        socketio: '../socket.io/socket.io',
    },

    shim: {
        backbone: {
            deps: ["jquery", "underscore"],
            exports: "Backbone"
        },
        jqueryui: {
            deps: ["jquery"],
            exports: "jqueryui"
        },
        foundation: {
            deps: ["jquery"],
            exports: "foundation"
        }
    }

});