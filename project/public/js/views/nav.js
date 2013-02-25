define([
    "jquery",
    "underscore",
    "backbone",
], function ($, _, Backbone) {
    // http://talkslab.github.com/metro-bootstrap/components.html
    // http://wbpreview.com/previews/WB08J69X2/blog-single.html
    var Home = Backbone.View.extend({

        events: {
        },

        initialize: function (options) {
            this.app = options.app || {};
            this.name = this.$el.find("#lnkName");
            this.initializeListeners();
        },

        initializeListeners: function () {
            var me = this;
            BackboneEvt.on("user:authenticated", function () {
                me.$el.find("#lnkName").text(app.user.getFullName())
            })
        }

    });

    return Home;
});
