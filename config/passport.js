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

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    // won't run if get missing credential error
    // passportjs is expecting user name and pasword
    function(req, username, password, done) {
        console.log ('LocalStrategy working...')
        findOrCreateUser = function() {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.username':username }, function(err, user) {
                // if there are any errors, return the error
                if (err) {
                    console.log('Error in Signup: ' + err);
                    return done(err);
                }

                // check to see if theres already a user with that email
                if (user) {
                    console.log('User already exists');
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    // set the user's local credentials
                    newUser.local.username  = username;
                    newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model
                    newUser.local.email = req.body.email;
                    // save the user
                    newUser.save(function(err) {
                        if (err) {
                            console.log('Error in Saving User: ' + err);
                            throw err;
                        }
                        console.log('User Registration sucessful');
                        return done(null, newUser);
                    });
                };

            });
    };
    process.nextTick(findOrCreateUser);
    }));

    /**
     * ========== Local Login ==========
     */

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'Incorrect username or password!')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Incorrect username or password!')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};