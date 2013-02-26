define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/splashscreen.html",
], function ($, _, Backbone, Template) {

    var SplashScreen = Backbone.View.extend({

        template: _.template(Template),

        events: {
        },

        initialize: function (options) {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

    return SplashScreen;
});
