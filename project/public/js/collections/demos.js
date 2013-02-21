define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var Demos = Backbone.Collection.extend({

        idAttribute: "_id",

        url: api + 'Users',

        initialize: function (options) {

        }


    });

    return Demos;
});
