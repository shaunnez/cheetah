define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/content/content.html",
], function ($, _, Backbone, Template) {
    // http://talkslab.github.com/metro-bootstrap/components.html
    // http://wbpreview.com/previews/WB08J69X2/blog-single.html

    var Content = Backbone.View.extend({

        template: _.template(Template),

        events: {

        },

        initialize: function (options) {
            this.app = options.app || {};
            this.render();
            //this.modelBinder = new Backbone.ModelBinder();
            //me.modelBinder.bind(me.app.user, me.el);
            this.initializeListeners();
        },

        initializeListeners: function () {
            var me = this;
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });

    return Content;
});
