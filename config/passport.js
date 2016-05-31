// load all the things we need 
var LocalStrategy = require ('passport-local').Strategy;

// load up the user model
var User = require('../models/user');

// expose this function to our app using module.exports 

module.exports = function (passport) {

	/**
	 * ========== Passport Session Setup ==========
	 * - required for persistent login sessions
	 * - passport needs ability to serialize and unseralize users of the session
	 */
	
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

	/**
	 * ========== Local Signup ==========
	 * - using named strategies since we have one for login and one for signup
	 * - TODO: make sure username is not already taken either 
	 * - TODO: Check if it is a valid email
	 */

	 passport.use('local-signup', new LocalStrategy ({
	 	// by default, local strategy uses username and passport, we will use email instead
	 	usernameField: 'email',
	 	passwordField: 'password',
 		passReqToCallback: true // allows us to pass back the entire request to the callback
	 },

	 function (req, email, password, done) {

	 	// Asynchronus
	 	// User.findOne wont fire unless data is sent back 
	 	process.nextTick (function() {

	 		// Find a user whose email is the same as the forms email
	 		// We are looking to see if the user trying to login already exists 
	 		User.findOne ({'local.email': email}, function (err, user) {
	 				if (err)
	 					return done(err);

	 				// Check to see if theres already a user with that email
	 				if (user) {
	 					return done (null, false, req.flash ('signupMessage', 'That email is already taken.'));
	 				} else {

	 					// if there is no user with that email, create the user
	 					var newUser = new User();

	 					// set the users local credentials
	 					newUser.local.email = email;
	 					newUser.local.password = newUser.generateHash (password);

	 					// save the user
	 					newUser.save(function(err) {
	 						if (err)
	 							throw err;
	 						return done (null, newUser);
	 					});
	 				}
	 			});
	 	});

	 }));
	
};