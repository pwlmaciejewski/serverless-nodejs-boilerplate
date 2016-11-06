'use strict';
const helpers = require(__dirname + '/helpers');
serverless.service.getAllFunctions().forEach(name => helpers.cleanFunctionBuild(serverless, name));
