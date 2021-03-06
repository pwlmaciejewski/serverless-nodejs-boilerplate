'use strict';

var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
	target: 'node',
	entry: './handler_src',
	output: {
		path: __dirname,
		filename: 'handler.js',
		libraryTarget: 'umd'
	},
	externals: [nodeExternals()],
	plugins: [],
	resolve: {
		extensions: ['', '.js']
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel'
			}
		]
	}
};
