console.log('connecting to socket')
var socket = io.connect();

// Emit ready event.
socket.emit('ready', {}, function(data) {
	console.log('connected to socket', data)
	$("#message").append("<p>" + data + "</p>");
})

socket.on('new user', function(data) {
	console.log("new user connected", data)
	$("#message").append("<p>" + data + "</p>");
})
