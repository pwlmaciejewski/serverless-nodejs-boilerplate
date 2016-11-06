module.exports = {
	foo: function(event, context, callback) {
		console.log('Foo says: HI!');
		callback(null, {
			statusCode: 200,
			body: 'Foo says: HI!'
		});
	}
};
