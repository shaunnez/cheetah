define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var Competitions = Backbone.Collection.extend({

        idAttribute: "_id",

        url: api + 'Competitions',

        initialize: function (options) {

        }

    });

    return Competitions;
});
