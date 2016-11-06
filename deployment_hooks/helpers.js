'use strict';

const path = require('path');
const sh = require('shelljs');

const tmpDirName = '.serverless_hooks';

const getTmpDirPath = serverless => `${ serverless.config.servicePath }/${ tmpDirName }`;

const getFunctionPath = (serverless, name) => {
	const functionObject = serverless.service.getFunction(name);
	const pathObject = path.parse(functionObject.handler);
	const dir = pathObject.dir;
	return `${ serverless.config.servicePath }/${ dir }`;
}

const getFunctionTmpNodeModulesPath = (serverless, name) => `${ getTmpDirPath(serverless) }/${ name }_node_modules`;

const buildFunction = (serverless, name) => {
	sh.mkdir('-p', getTmpDirPath(serverless));
	sh.cd(getFunctionPath(serverless, name));

	const pkg = require(`${ sh.pwd() }/package.json`);
	if (pkg.scripts && pkg.scripts.build) {
		if (!sh.test('-d', 'node_modules')) {
			serverless.cli.log(`Installing development dependencies: ${ name }...`);
			sh.exec('npm install');
		}
		serverless.cli.log(`Building package: ${ name }...`);
		sh.exec('npm run build');		
	}

	if (sh.test('-d', 'node_modules')) {
		const target = getFunctionTmpNodeModulesPath(serverless, name);
		if (sh.test('-d', target)) sh.rm('-rf', target);
		sh.mv('node_modules', target);		
	}
	serverless.cli.log(`Installing production dependencies: ${ name }...`);
	sh.exec('npm install --production');
}

const cleanFunctionBuild = (serverless, name) => {
	sh.cd(getFunctionPath(serverless, name));
	sh.test('-d', 'node_modules') && sh.rm('-rf', 'node_modules');
	
	const functionTmpNodeModulesPath = getFunctionTmpNodeModulesPath(serverless, name);
	sh.test('-d', functionTmpNodeModulesPath) && sh.mv(functionTmpNodeModulesPath, 'node_modules');	

	const tmpDirPath = getTmpDirPath(serverless);
	!sh.ls('-lA', tmpDirPath).length && sh.rm('-rf', tmpDirPath);

	const pkg = require(`${ sh.pwd() }/package.json`);
	if (pkg.scripts && pkg.scripts['build-clean']) {
		sh.exec('npm run build-clean');
	}
}

module.exports = {
	tmpDirName,
	getTmpDirPath,
	getFunctionPath,
	getFunctionTmpNodeModulesPath,
	buildFunction,
	cleanFunctionBuild
};