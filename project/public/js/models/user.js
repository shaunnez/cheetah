define([
    "jquery",
    "backbone"
], function ($, Backbone) {

    var User = Backbone.Model.extend({

        idAttribute: "_id",

        urlRoot: api + 'Users',

        initialize: function (options) {

        },

        defaults: {

        },

        validate: function (attrs) {

        },

        getId: function () {
            return this.has("_id") ? this.get("_id") : "";
        },

        getFullName: function () {
            var name = this.has("firstname") ? this.get("firstname") : "";
            name += this.has("lastname") ? " " + this.get("lastname") : "";
            if((name == "") || (name == "" && this.has("username") == false))
                return "Guest";
            else
                return name;
        },

        authenticated: function () {
            return this.has("authenticated") ? this.get("authenticated") : false;
        }

    });

    return User;
});
