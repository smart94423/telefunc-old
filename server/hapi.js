const MiddlewareFactory = require('./MiddlewareFactory');
const HapiAdapter = require('@universal-adapter/hapi');
module.exports = MiddlewareFactory(HapiAdapter, {useOnPreResponse: true});
