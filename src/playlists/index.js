// src/playlists/index.js
const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistsService, songsService, validator }) => {
    // Perhatikan: playlistsService sekarang di-inject dengan songsService
    // Kita akan membuat instance playlistsService di server.js dengan songsService
    const playlistsHandler = new PlaylistsHandler(playlistsService, validator);
    server.route(routes(playlistsHandler));
  },
};