﻿define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/navbar.html",
], function ($, _, Backbone, Template) {

    var Nav = Backbone.View.extend({

        template: _.template(Template),

        events: {

        },

        initialize: function (options) {
            this.app = options.app || {};
            this.render();
            this.name = this.$el.find("#lnkName");
            this.initializeListeners();
        },

        initializeListeners: function () {
            var me = this;
            BackboneEvt.on("user:authenticated", function () {
                me.name.text(app.user.getFullName())
            })
        },


        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

    return Nav;
});
