import isItThursday from 'is-it-thursday';

export function buildExample(event, context, callback) {
	callback(null, {
		statusCode: 200,
		body: `Is it thursday: ${ isItThursday.huh }`
	});
}

