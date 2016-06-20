module.exports = function (app, io, passport) {

// ================== Home Page ================== 
	app.get ('/', function (req, res) {
		res.render('index');
	});
// ================== Chat Page ================== 
	app.get ('/chat', function (req, res) {
		
		// render the page and pass in any flash data if it exists
		// loginMessage will be created inside of passport
		res.render ('chat', {
			message: req.flash('loginMessage')
		});
	});


// ================== Login ================== 
	app.get ('/login', function (req, res) {
		
		// render the page and pass in any flash data if it exists
		// loginMessage will be created inside of passport
		// console.log(req.flash());
		res.render ('login', {
			message: req.flash('loginMessage')
		});
	});

	app.post ('/login', function (req, res) {
		console.log(req.body);
		req.checkBody('username', 'Email is empty!' ).notEmpty();
		req.checkBody('username', 'Email is not valid!').isEmail();
		req.checkBody('password', 'Password is empty!').notEmpty();
	
		var err = req.validationErrors();

		if (err) {
			console.log (err);
			req.flash('loginMessage', 'Incorrect username or password.')
			req.session.save(function () {
				res.redirect('/login');
			});
		} else {
			passport.authenticate('local-login', {
				successRedirect: '/chat',
				failureRedirect: '/login',
				failureFlash: true
			});
		}

	});

// ================== Sign up ================== 
	app.get ('/signup', function (req, res) {
		res.render ('signup', {
			message: req.flash('signupMessage')
		});
	});
   // app.post('/signup', passport.authenticate('local-signup', {
   //      successRedirect : '/chat', // redirect to the secure profile section
   //      failureRedirect : '/signup', // redirect back to the signup page if there is an error
   //      failureFlash : true // allow flash messages
   //  }));

   	app.post ('/signup', function (req, res) {
		console.log(req.body);
		req.checkBody('username', 'Email is empty!' ).notEmpty();
		req.checkBody('username', 'Email is not valid!').isEmail();
		req.checkBody('password', 'Password is empty!').notEmpty();
		var err = req.validationErrors();

		if (err) {
			console.log (err);
			req.flash('signupMessage', 'Incorrect signup information.')
			req.session.save(function () {
				res.redirect('/signup');
			});
		} else {
			passport.authenticate('local-signup', {
				successRedirect: '/chat',
				failureRedirect: '/signup',
				failureFlash: true
			});
		}

	});

// ================== Logout  ================== 
// TODO: Implement a "You"

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