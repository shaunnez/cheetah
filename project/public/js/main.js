var root    = "/",
    server  = "http://localhost:8081",
    api     = "http://localhost:8081/api/",
    fbAppId = "169058573244705";

require([
    "jquery",
    "underscore",
    "backbone",
    "router",
    "app",
    "modelbinder",
    "collectionbinder",
    "jqueryui",
    "pnotify",
    "bootstrap",
    "datepicker",
    "bootbox",
	"select2",
    "moment",
    'socketio',
], function($, _, Backbone, Router, app) {
    
    $(document).ready(function () {

        // load initial views and authentication
        app.initialize();

        // load the router
        app.router = new Router();

        // start tracking history 
        Backbone.history.start({ pushState: true });

        // ignore backbone push state links with data-bypass on them
        $(document).on("click", "a:not([data-bypass])", function (evt) {
            var href = $(this).attr("href");
            if (href && href.indexOf("#") === 0) {
                evt.preventDefault();
                Backbone.history.navigate(href, true);
            }
        });

        //nice scroll effect for home pages 
        $(document).on('click', "a[data-bypass]", function (evt) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            
            evt.preventDefault();
        });

    })

});
