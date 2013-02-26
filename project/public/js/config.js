require.config({

    deps: ["main"],

    paths: {
        libs: "../js/libs",
        jquery: "../js/libs/jquery",
        jqueryui: "../js/libs/jqueryui",
        pnotify: "../js/libs/jquery.pnotify",
        underscore: "../js/libs/underscore-min",
        backbone: "../js/libs/backbone",
        modelbinder: "../js/libs/backbone.modelbinder",
        collectionbinder: "../js/libs/backbone.collectionbinder",
        iosync: "../js/libs/backbone.iosync",
        iobind: "../js/libs/backbone.iobind",
        text: "../js/libs/text",
        bootstrap: "../js/libs/bootstrap",
        bootbox: "../js/libs/bootbox",
        datepicker: "../js/libs/bootstrap-datepicker",
        select2: "../js/libs/select2",
        moment: "../js/libs/moment",
        socketio: '../socket.io/socket.io',
    },

    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ["jquery", "underscore"],
            exports: "Backbone"
        },
        modelbinder: {
            deps: ["backbone"],
            exports: "modelbinder"
        },
        collectionbinder: {
            deps: ["backbone", "modelbinder"],
            exports: "collectionbinder"
        },
        iosync: {
            deps: ["backbone"],
            exports: "iosync"
        },
        iobind: {
            deps: ["backbone", "iosync"],
            exports: "iobind"
        },
        jqueryui: {
            deps: ["jquery"],
            exports: "jqueryui"
        },
        pnotify: {
            deps: ["jquery"],
            exports: "pnotify"
        },
        bootstrap: {
            deps: ["jquery"],
            exports: "bootstrap"
        },
        bootbox: {
            deps: ["bootstrap"],
            exports: "bootbox"
        },
        datepicker: {
            deps: ["bootstrap"],
            exports: "datepicker"
        },
		select2: { 
            deps: ["jquery"],
            exports: "select2"		
		}
    }

});