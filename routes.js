module.exports = function (app, io, passport) {

// ================== Home Page ================== 
	app.get ('/', function (req, res) {
		res.render('index');
	})

// ================== Login ================== 
	app.get ('/login', function (req, res) {
		
		// render the page and pass in any flash data if it exists
		// loginMessage will be created inside of passport
		res.render ('login', {
			// message: req.flash('loginMessage')
		});
	});

// process the login form
// app.post('/login', /** passport stuff **/);

// Forget Password button

// ================== Sign up ================== 
	app.get ('/signup', function (req, res) {
		res.render ('signup', {
			// message: req.flash('signupMessage')
		});
	});

// process the signup form
// app.post ('/signup', /** passport stuff **/ ));

// ================== Logout  ================== 

	app.get ('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	})

// ================== Chat Connectoin ================== 

	io.on ('connection', function (socket) {
		socket.on('chat message', function(msg) {
			io.emit('chat message', msg);
		})
	})
};

// route middleware to make sure a user is logged in

function isLoggedIn (req, res, next) {
	
	// if user is autheticated in the session, carry on 
	if (req.isAuthenticated()) 
		return next();

	// if they arent, redirect them to the home page
	res.redirect('/');
};