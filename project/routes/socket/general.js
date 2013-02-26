/*********************************************************************************
	Dependencies
/********************************************************************************/
var request = require('request')
// load the methods from the parent file
var methods = module.parent.exports.methods;
// reference io from parent so we can broadcast
var io = module.parent.exports.io;
var sessionStore = module.parent.exports.sessionStore;
/*********************************************************************************
     Routes - exported so other files can access them
/********************************************************************************/
module.exports = {

    reloadsession: function (data, fn) {
        var me = this;
        sessionStore.load(this.handshake.sessionId, function (err, session) {
            // updates the session
            me.handshake.session = session;
            // send the user
            fn(session.user);
        })
    },

    login: function (data, fn) {
        var me = this;
        methods.login(data, function (result) {
            var session = me.handshake.session;
            session.user = result.data;
            session.save();
            fn(result);
        });
    },

    facebook: function(data, fn) {
        var me = this;
        methods.facebook(data, function (result) {
            var session = me.handshake.session;
            session.user = result.data;
            session.save();
            fn(result);
        })
    },

    register: function (data, fn) {
        var me = this;
        methods.register(data, function (result) {
            var session = me.handshake.session;
            session.user = result.data;
            session.save();
            fn(result);
        })
	},
	
	message: function(data) {
		/*// to broadcast to all open windows of this session
		io.sockets.in(this.handshake.sessionID).emit('syncy', { message : 'syncy syncy'} );
		// to emit to just itself
		this.emit('syncy', { message : 'syncy syncy'})
		// if we want to use namespsaces
		io.of('namespace').in(this.handshake.sessionID).emit('syncy', { message : 'syncy syncy'} );
		// all rooms can be got using
		io.sockets.manager.rooms
		// clients in a room
		io.sockets.clients('my room')
		// clients in a namespaced room
		io.of('namespace').clients('room')
		// rooms a client has joined
		io.sockets.manager.roomClients[socket.id]*/
	},
	
	joinRoom: function(name) {
		this.join(name);
	},
	
	leaveRoom: function(name) {
		this.leave(room);
	}

	demoAuthenticateMethod: function(data, callback) {
	    methods.authenticateSession(this.handshake.sessionId, "loggedMethod", "POST", data, function(result) {
	        if(result == false) {
	            // logout or ask for authethentication
	        } else {
	            // do DB method here
	        }
	    });
	}
}
/*********************************************************************************
     End
/********************************************************************************/