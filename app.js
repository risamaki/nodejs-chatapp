// Initialize a new express.js instance 
// requires the config and route files 
// listens on a port 
// Start the app by running 'node app.js' in your terminal

var express = require('express'),
	app = express();

var port = process.env.PORT || 5000;

// This is needed if the app is run on heroku
// var port = process.env.PORT || 8080;

// Initialize a new socket.io object. It is bound to the express app, which allows them to 
// coexist 

var io = require('socket.io').listen(app.listen(port, function() {
	console.log('Listening on port' + port);
}));

require('./config')(app,io);
require('./routes')(app,io);