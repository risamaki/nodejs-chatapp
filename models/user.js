var mongoose 	= require ('mongoose');
var bcrypt 		= require ('bcrypt-nodejs');

// define the schema for the user model
var userSchema = mongoose.Schema ( {
		local		: {
		email		: String,
		password	: String
	},
});

// Generating a hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if the password is valid 
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// Create the model for users and expose it to our own app
module.exports = mongoose.model('Users', userSchema);


