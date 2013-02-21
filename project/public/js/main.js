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
    "jqueryui",
    "bootstrap",
    'socketio',
], function($, _, Backbone, Router, app) {
    
    $(document).ready(function () {
        
        app.initialize();

        app.router = new Router();

        Backbone.history.start({ pushState: true });

        $(document).on("click", "a:not([data-bypass])", function (evt) {
            var href = $(this).attr("href");
            if (href && href.indexOf("#") === 0) {
                evt.preventDefault();
                Backbone.history.navigate(href, true);
            }
        });

    })
});
