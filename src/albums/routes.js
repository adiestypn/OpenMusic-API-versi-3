const Boom = require('@hapi/boom');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.addAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.editAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
{
  method: 'POST',
  path: '/albums/{id}/covers',
  handler: handler.postAlbumCoverHandler,
  options: {
    payload: {
      output: 'stream',
      parse: true,
      multipart: {
        output: 'stream',
      },
      maxBytes: 512000,
      failAction: (request, h, err) => {
        if (err.output && err.output.statusCode === 400 && err.message.includes('Payload content length greater than maximum allowed')) {
          throw Boom.entityTooLarge('Payload content length greater than maximum allowed');
        }
        throw err;
      },
    },
  },
}
]

module.exports = routes;
