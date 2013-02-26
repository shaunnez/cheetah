define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var Competitions = Backbone.Collection.extend({

        idAttribute: "_id",

        url: 'Competitions',

        socket: app.socket,

        initialize: function (options) {
            //_.bindAll(this, 'serverCreate', 'collectionCleanup');
        }

    });

    return Competitions;
});
