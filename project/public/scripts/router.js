define([
    "jquery",
    "underscore",
    "backbone",
], function($, _, Backbone) {

    var Router = Backbone.Router.extend({

        routes: {
            'users'     : 'users',
            'users/:id' : 'user',
            '*actions'  : 'defaultAction'
        },

        users: function () {
            BackboneEvt.trigger('router:change', { page: 'users', title: "Users" });
        },

        user: function (id) {
            BackboneEvt.trigger('router:change', { page: 'user', title: "User Details", id: id });
        },

        defaultAction: function () {
            BackboneEvt.trigger('router:change', { page: 'home', title: "Home" });
        }

    });

    return Router;

});
