define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var Users = Backbone.Collection.extend({

        idAttribute: "_id",

        url: api + 'Users',

        initialize: function (options) {

        }


    });

    return Users;
});
