// Required by app.js

var express = require ('express');

module.exports = function (app, io) {

	// Set. html as the default template extension (rather than Jade)
	app.set ('view engine', 'html');

	// Initialize the ejs template engine (?)
	// app.set ('html', require('ejs').renderFile);

	// Tell express where it can find the templates;
	app.set('views', __dirname + '/views');

	// Make the files in the public folder avaliable to the world
	app.use(express.static(__dirname + '/public'));
}