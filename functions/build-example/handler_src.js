export function buildExample(event, context, callback) {
	console.log('Build examle says: HI!');
	callback(null, {
		statusCode: 200,
		body: 'Build example says: HI!'
	});
}

