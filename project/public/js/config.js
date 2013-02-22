require.config({

    deps: ["main"],

    paths: {
        libs: "../js/libs",
        jquery: "../js/libs/jquery",
        jqueryui: "../js/libs/jqueryui",
        underscore: "../js/libs/underscore-min",
        backbone: "../js/libs/backbone",
        text: "../js/libs/text",
        bootstrap: "../js/libs/bootstrap",
		select2: "../js/libs/select2",
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
        bootstrap: {
            deps: ["jquery"],
            exports: "bootstrap"
        },
		select2: { 
            deps: ["jquery"],
            exports: "select2"		
		}
    }

});