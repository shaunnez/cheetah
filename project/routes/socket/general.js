/*********************************************************************************
	Dependencies
/********************************************************************************/
var request = require('request')
// parent config, could use relative path require here
var config = module.parent.exports.config;
// load the methods from the parent file
var methods = module.parent.exports.methods;
// reference io from parent so we can broadcast
var io = module.parent.exports.io;
var sessionStore = module.parent.exports.sessionStore;
/*********************************************************************************
     Routes - exported so other files can access them
            - var me = this refers to the "socket" object which you can emit from
            - next is a callback function
/********************************************************************************/
module.exports = {

    // authenticate a users session - can be called from another socket method here or externally
    // returns true or false to the callback function next
    // emits unauthenticate to the server
    authenticateSession: function (next) {
        var me = this;
        if (this.session) {
            var date = new Date(this.session.cookie.expires);
            // if its still valid, go to the next method
            if (date.getTime() > new Date().getTime()) {
                next(true);
            } else {
                // remove this session
                methods.deleteCollectionItem(config.database.collection, sessionId, function (result) {
                    me.emit("unauthenticate");
                    next(false);
                })
            }
        } else {
            me.emit("unauthenticate");
            next(false);
        }
    },

    // force reload of a session and update the socket handshake session
    // although we keep this up to date via an interval, it can be useful for immediate refresh
    // for example, twitter or google login which updates the express session but not the sockets 
    reloadsession: function (data, next) {
        var me = this;
        sessionStore.load(this.handshake.sessionId, function (err, session) {
            // updates the session
            me.handshake.session = session;
            // send the user
            next(session.user);
        })
    },

    // email and password login method
    login: function (data, next) {
        var me = this;
        methods.login(data, function (result) {
            var session = me.handshake.session;
            session.user = result.data;
            session.save();
            next(result);
        });
    },

    // facebook login method
    facebook: function (data, next) {
        var me = this;
        methods.facebook(data, function (result) {
            var session = me.handshake.session;
            session.user = result.data;
            session.save();
            next(result);
        })
    },

    // register
    register: function (data, fn) {
        var me = this;
        if(me.handshake.session && me.handshake.session.user && me.handshake.session.user.twitterId) {
            data.twitterId = me.handshake.session.user.twitterId;
        }

        methods.register(data, function (result) {
            var session = me.handshake.session;
            session.user = result.data;
            session.save();
            next(result);
        })
	},
	
    // not used
	message: function(data) {
		/*// to broadcast to all open windows of this session
		io.sockets.in(this.handshake.sessionId).emit('syncy', { message : 'syncy syncy'} );
		// to emit to just itself
		this.emit('syncy', { message : 'syncy syncy'})
		// if we want to use namespsaces
		io.of('namespace').in(this.handshake.sessionId).emit('syncy', { message : 'syncy syncy'} );
		// all rooms can be got using
		io.sockets.manager.rooms
		// clients in a room
		io.sockets.clients('my room')
		// clients in a namespaced room
		io.of('namespace').clients('room')
		// rooms a client has joined
		io.sockets.manager.roomClients[socket.id]*/
	},
	
    // join a specific channel or room
	joinRoom: function(name) {
		this.join(name);
	},
	
    // leave a specific channel or room, generally happens automatically by socket.io
	leaveRoom: function(name, next) {
	    this.leave(room);
	}
}
/*********************************************************************************
     End
/********************************************************************************/