const Hapi = require('hapi');
const Inert = require('@hapi/inert');
const {getApiResponse} = require('wildcard-api');
require('./api/endpoints');

startServer();

async function startServer() {
  const server = Hapi.Server({
    port: 3000,
    debug: {request: ['internal']},
  });

  server.route({
    method: '*',
    path: '/wildcard/{param*}',
    handler: async (request, h) => {
      const requestProps = {
        url: request.url,
        method: request.method,
        body: request.payload,
        // For example, to access the HTTP request headers in your endpoint functions:
        headers: request.headers,
      };
      const responseProps = await getApiResponse(requestProps);
      const response = h.response(responseProps.body);
      response.code(responseProps.statusCode);
      response.type(responseProps.contentType);
      return response;
    },
  });

  await server.register(Inert);
  server.route({
    method: '*',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'client/dist',
        defaultExtension: 'html',
      }
    }
  });

  await server.start();

  console.log('Server is running. Go to http://localhost:3000')
}
