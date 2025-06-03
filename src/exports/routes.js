const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/notes',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];
 
module.exports = routes;