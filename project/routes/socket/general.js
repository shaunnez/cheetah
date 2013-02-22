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
var count = 0;
module.exports = {
	
	register: function(data, fn) {
		/* methods.registerUser(data, function (result) {
			
            req.session.user = result.data;
            res.send(result);
        });
		console.log('got this data for register', data.firstname);
		fn('here you go')*/
		var session = this.handshake.session;
		var sessionId = this.handshake.sessionId;
		var session2 = this.manager.handshaken[this.id].session;
		var user = this.user;
		session.user = data;
		session.save();
		
		// set stuff on the socket
		this.set("dad", "mum", function(err, data) {
			console.log('set it')
		})

		/*
		this.get('session', function(err, user) {
			console.log(err, user)
		})
		this.set('user', data, function() {
			console.log('set user as ', data)
		})*/
	},
	
	message: function(data) {
		
	},
	
	joinRoom: function() {
		
	},
	
	disconnect: function(data) {
		console.log('socket disconnection')
		// io.broadcast()
	}
}
/*********************************************************************************
     End
/********************************************************************************/