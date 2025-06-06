const ExportsHandler = require('./handler');
const routes = require('./routes');
 
module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(service, validator, playlistsService);
    server.route(routes(exportsHandler));
  },
};
