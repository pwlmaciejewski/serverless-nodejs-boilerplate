'use strict';

var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
	target: 'node',
	entry: './lambda_src',
	output: {
		path: __dirname,
		filename: 'lambda.js',
		libraryTarget: 'umd'
	},
	externals: [nodeExternals({
		whitelist: [/^planity-helpers/]
	}), './config'],
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: false }
		})
	],
	resolve: {
		extensions: ['', '.js']
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel'
			}
		],
		noParse: [/moment.js/, /google-libphonenumber/]
	}
};
