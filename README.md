# serverless-nodejs-boilerplate

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

Node.js boilerplate for [Serverless Framework](http://www.serverless.com).

## Rationale

This bootstrap is based around an idea that every lambda function can be a **separate npm package**. 
It also means that each of them can define their **own dependencies**, **test workflow** and **build step**.
While it's an elegant apprach it has it's drawbacks: how to implement build step and
how to deal with dev dependencies that can often be huge and shouldn't be packaged and deployed along 
with production dependencies.

This project makes use of 
[serverless-scriptable-plugin](https://github.com/wei-xu-myob/serverless-scriptable-plugin) 
and defines a bunch of deployment hooks to solve those problems.

## Installation

```
git clone git@github.com:pwlmaciejewski/serverless-nodejs-boilerplate.git
cd serverless-nodejs-boilerplate
npm install
touch serverless.env.yml
vim serverless.env.yml
```

`serverless.env.yml` format:

```
stage: prod
region: us-west-1 
accessKeyId: MY_ACCESS_KEY_ID
secretAccessKey: MY_SECRET_ACCESS_KEY
```

## Examples

In `functions` directory you will find examples of how you can make use of this project:

* [`functions/basic`](https://github.com/pwlmaciejewski/serverless-nodejs-boilerplate/tree/master/functions/basic) - 
basic example with no deps, bare-bone js
* [`functions/basic-with-deps`](https://github.com/pwlmaciejewski/serverless-nodejs-boilerplate/tree/master/functions/basic-with-deps) - 
yet another basic example but this time with some npm production deps
* [`functions/build-with-internal-dev-deps`](https://github.com/pwlmaciejewski/serverless-nodejs-boilerplate/tree/master/functions/build-with-internal-dev-deps) - 
fully independent package with build (defined by convention 
in `build` npm script) and cleanup (npm `build-clean` script); while the most versatile it takes a long time to build because
of dev deps (namely babel).
* [`function/build-with-external-dev-deps`](https://github.com/pwlmaciejewski/serverless-nodejs-boilerplate/tree/master/functions/build-with-external-dev-deps) - 
balanced setup where dev deps are located in project root (taking advantage
of [Node.js modules loading](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders)); it takes less time
to build since all packages can share the same dev build deps.
