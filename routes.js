// load up the user model
var User = require('/models/user');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');

module.exports = function (app, io, passport) {

// ================== Home Page ================== 
	app.get ('/', function (req, res) {
		res.render('index', {
			message: req.flash('indexMessage')
		});
	});
// ================== Chat Page ================== 
	app.get ('/chat', isLoggedIn, function (req, res) {
		
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
		req.checkBody('username', 'Username is empty!' ).notEmpty();
		//req.checkBody('username', 'Email is not valid!').isEmail();
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
			})(req,res);
		}

	});

// ================== Sign up ================== 
	app.get ('/signup', function (req, res) {
		res.render ('signup', {
			message: req.flash('signupMessage')
		});
	});

   	app.post ('/signup', function (req, res) {
		console.log(req.body);
		req.checkBody('email', 'Username is empty!' ).notEmpty();
		req.checkBody('email', 'Username is not valid!').isEmail();
		req.checkBody('username', 'Username is empty!' ).notEmpty();
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
			})(req,res);
		}

	});

// ================== Logout  ================== 

	app.get ('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	})

// ================== Forgot Password  ================== 
	app.get ('/forgot', function (req, res) {
			res.render ('forgot', {
			message: req.flash('forgotPasswordMessage')
		});
	});

	app.post('/forgot', function(req, res, next) {
	  async.waterfall([
	    function(done) {
	      crypto.randomBytes(20, function(err, buf) {
	        var token = buf.toString('hex');
	        done(err, token);
	      });
	    },

	    function(token, done) {
	      User.findOne({ 'local.email': req.body.email }, function(err, user) {
	        if (!user) {
	          req.flash('forgotPasswordMessage', 'No account with that email address exists.');
	          return res.redirect('/forgot');
	        }

	        user.local.resetPasswordToken = token;
	        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

	        user.save(function(err) {
	          done(err, token, user);
	        });
	      });
	    },

	    function(token, user, done) {
	      var smtpTransport = nodemailer.createTransport('SMTP', {
	        service: 'gmail',
	        auth: {
	          user: 'risamakigit',
	          pass: 'Passwordgit'
	        }
	      });
	      var mailOptions = {
	        to: user.local.email,
	        from: 'risamakigit@gmail.com',
	        subject: 'Risamaki Chat Application Password Reset',
	        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
	          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
	          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
	          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
	      };

	      smtpTransport.sendMail(mailOptions, function(err) {
	        req.flash('forgotPasswordMessage', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
	        done(err, 'done');
	      });
	    }
	  ], function(err) {
	    if (err) return next(err);
	    res.redirect('/forgot');
	  });
});

// ================== Reset Password  ================== 
	// app.get ('/reset', function (req, res) {
	// 		res.render ('reset', {
	// 		message: req.flash('resetPasswordMessage')
	// 	});
	// });
app.get('/reset/:token', function(req, res) {
  User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('forgotPasswordMessage', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      // user: req.user
      message: req.flash('resetPasswordMessage')
    });
  });
});

app.post('/reset/:token', function(req, res) {
	console.log(req.body);
  async.waterfall([
    function(done) {
      User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('forgotPasswordMessage', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }

        user.local.password = user.generateHash(req.body.newpassword);
        user.local.resetPasswordToken = undefined;
        user.local.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
	        service: 'gmail',
	        auth: {
	          user: 'risamakigit',
	          pass: 'Passwordgit'
	        }
      });
      var mailOptions = {
        to: user.email,
        from: 'risamaki@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        // req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/chat');
  });
});

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