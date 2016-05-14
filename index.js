var express = require ('express');
var app = express();
var http = require('http').Server(app);

// Instantiate a new instance of socket.io by passing the http (HTTP server) object
var io = require('socket.io')(http);

// In NodeJS, __dirname is always the directory in which the currently executing script resides 
app.get('/', function (req, res) {

	// sendFile: transfers the file at the given path (file contains basic markup of chat)
	res.sendFile(__dirname + '/index.html');
});

// listen on the connection event for incoming sockets --> log it into the console 
// io.on('connection', function (socket) {
// 	console.log('An user connected');
// 	socket.on('disconnect', function() {
// 		console.log('An user disconnected');
// 	});
// });

io.on('connection', function(socket) {
	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
