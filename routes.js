module.exports = function (app, io) {
	app.get ('/', function (req, res) {
		res.render('home');
	})

	var chat = io.on ('connection', function (socket) {
		socket.on('chat message', function(msg) {
			io.emit('chat message', msg);
		})
	})
}