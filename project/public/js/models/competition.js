define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var Competition = Backbone.Model.extend({

        idAttribute: "_id",

        urlRoot: api + 'Competitions',

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

    return Competition;
});
