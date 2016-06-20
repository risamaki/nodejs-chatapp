
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
// resetPasswordToken and resetPasswordExpires are set only after the password resets 
// and properties will not be set when creating a new user
var userSchema = mongoose.Schema({

    local            			: {
        email        			: String,
        username     			: String,
        password     			: String,
        resetPasswordToken 		: String,
        resetPasswordExpires	: Date 
    },
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
