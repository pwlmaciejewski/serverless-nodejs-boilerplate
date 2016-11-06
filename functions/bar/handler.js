'use strict';
const _ = require('underscore');

module.exports = {
	bar: function(event, context, callback) {
		console.log('Bar says: HI!');
		const text = _.reduce([1, 2, 3], function(acc, num) {
			return acc + num;
		}, '')
		callback(null, {
			statusCode: 200,
			body: 'Bar says: ' + text
		});
	}
};
