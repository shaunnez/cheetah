define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var Demo = Backbone.Model.extend({

        idAttribute: "_id",

        urlRoot: api + 'Demo',

        initialize: function (options) {

        },

        defaults: {

        },

        validate: function (attrs) {

        },

        getId: function () {
            return this.has("_id") ? this.get("_id") : "";
        }

    });

    return Demo;
});
