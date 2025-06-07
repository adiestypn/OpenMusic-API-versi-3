const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  // MODIFIKASI: Terima lebih banyak service pada fungsi register
  register: async (server, { service, validator, storageService, uploadsValidator }) => { 
    // MODIFIKASI: Teruskan semua service ke handler
    const albumsHandler = new AlbumsHandler(service, validator, storageService, uploadsValidator); 
    server.route(routes(albumsHandler));
  },
};