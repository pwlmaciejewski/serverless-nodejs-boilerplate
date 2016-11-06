'use strict';

var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
	target: 'node',
	devtool: 'eval',
	externals: [nodeExternals({
		whitelist: [/^planity-helpers/]
	})],
	resolve: {
		extensions: ['', '.js', '.json']
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel?plugins=babel-plugin-rewire'
			},
			{
				test: /\.json$/,
				loader: 'json'
			}
		],
		noParse: [/moment.js/, /google-libphonenumber/]
	}
};
