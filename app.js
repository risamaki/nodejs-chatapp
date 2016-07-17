// ========================== Set up ==========================

var express 	= require('express');
var port 		= process.env.PORT || 3010;
var flash 		= require ('connect-flash');
var mongoose 	= require ('mongoose');
var passport 	= require ('passport');

var morgan				= require ('morgan');
var cookieParser		= require ('cookie-parser');
var bodyParser			= require ('body-parser');
var expressValidator	= require ('express-validator');	
var session				= require ('express-session');
var MongoStore  		= require ('connect-mongo')(session); 
var SessionStore = new MongoStore({mongooseConnection: mongoose.connection,
													ttl: 2 * 24 * 60 * 60})
var passportSocket 		= require ("passport.socketio");

var app = express();
// Has to be below the app variable
// var server 	= require('http').Server(app); // creates http server 
// var io 		= require('socket.io')(server); //sets up websocket server to run in same app
// // ==========================  DB Config ========================== 

var dbConfig = require('./config/database.js');
mongoose.connect(dbConfig.url);

// // ========================== Set up Express Application ==========================

// Cookie Parser must come before the session
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({ secret: 'risamakichatapplication',
							saveUnitialized: true,
							resave: true,
							store: SessionStore})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // session secret)); // persistent login sessions
app.use(morgan('dev')); // log every request to the console
 
// Set. html as the default template extension (rather than Jade)
app.set ('view engine', 'ejs'); 

// Tell express where it can find the templates;
app.set('views', __dirname + '/views');

// Make the files in the public folder avaliable to the world
app.use(express.static(__dirname + '/public'));

// // ========================== Required for Passport ==========================
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/passport')(passport); // pass passport for configuration

// // ========================== Socket.io Connection ==========================

var io = require('socket.io').listen(app.listen(port, function() {
	console.log('Listening on port ' + port);
}));

io.use(passportSocket.authorize( {
	cookieParser: 	cookieParser,
	key: 			'connect.sid',
	secret: 		'risamakichatapplication',
	store: 			SessionStore,
	sucess: 		onAuthorizeSuccess,
	fail: 			onAuthorizeFail,
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);

}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);

}


// ========================== Routes ==========================

// configured passport object is passed to routes.js to be used in routes
// require('./routes')(app, io, passport);
require('./routes')(app, io, passport);



