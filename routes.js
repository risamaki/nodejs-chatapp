module.exports = function (app, io, passport) {

	app.get ('/', function (req, res) {
		res.render('home');
	});

	// app.get ('/login', function (req, res) {
	// 	res.render('login');
	// })

	io.on ('connection', function (socket) {
		socket.on('chat message', function(msg) {
			io.emit('chat message', msg);
		})
	})
}