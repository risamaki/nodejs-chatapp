// ========================== Set up ==========================

var express 	= require('express');
var app 		= express();
var port 		= process.env.PORT || 3000;
var flash 		= require ('connect-flash');
var mongoose 	= require ('mongoose');
var passport 	= require ('passport');

var morgan			= require ('morgan');
var cookieParser	= require ('cookie-parser');
var bodyParser		= require ('body-parser');
var session			= require ('express-session');


// // ==========================  DB Config ========================== 

var configDB = require ('./config/database.js');
mongoose.connect(configDB.url); // connects to our database


// // ========================== Set up Express Application ==========================

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({ secret: 'risamakichatapplication' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Set. html as the default template extension (rather than Jade)
app.set ('view engine', 'html'); 

// Initialize the ejs template engine (?)
app.engine ('html', require('ejs').renderFile);

// Tell express where it can find the templates;
app.set('views', __dirname + '/views');

// Make the files in the public folder avaliable to the world
app.use(express.static(__dirname + '/public'));

// // ========================== Required for Passport ==========================
require ('./config/passport')(passport); // pass passport object for configuration

// app.use (session ({
// 	secret: 'nodejschatapp'
// }));
// app.use (passport.initialize());
// app.use (passport.session()); // necessary for persistent login sessions
// app.use (flash()); // use connect-flash for flash messages stored in session


// // ========================== Socket.io Connection ==========================

var io = require('socket.io').listen(app.listen(port, function() {
	console.log('Listening on port ' + port);
}));

// ========================== Routes ==========================

// configured passport object is passed to routes.js to be used in routes
require('./routes')(app, io, passport);



