define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/right-sidebar.html"
], function ($, _, Backbone, Template) {

    var Sidebar = Backbone.View.extend({

        template: _.template(Template),

        events: {

        },

        initialize: function (options) {
            this.render();
            this.initializeListeners();
        },

        initializeListeners: function () {
            var me = this;
            BackboneEvt.on("user:authenticated", function () {
                me.$el.find("li.disabled").removeClass('disabled');
            })
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

    return Sidebar;
});
