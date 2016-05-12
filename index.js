var express = require ('express');
var app = express();
var http = require('http').Server(app);

// NodeJS __dirname is always the directory in which the currently executing script resides 
app.get('/', function (req, res) {

	// sendFile: transfers the file at the given path (file contains basic markup of chat)
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
