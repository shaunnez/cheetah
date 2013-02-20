/*********************************************************************************
	Dependencies
/********************************************************************************/
var request = require('request')
// load the methods from the parent file
var methods = module.parent.exports.methods;
// reference io from parent so we can broadcast
var io = module.parent.exports.io;
/*********************************************************************************
     Routes - exported so other files can access them
/********************************************************************************/
module.exports = {
	
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