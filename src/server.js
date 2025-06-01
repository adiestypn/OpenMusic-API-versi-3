// src/server.js
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// ... (Impor plugin dan service lain yang sudah ada)
const AlbumsPlugin = require('./albums/index');
const SongsPlugin = require('./songs');
const users = require('./users');
const authentications = require('./authentications');

// Impor plugin playlist BARU
const playlists = require('./playlists'); // <--- TAMBAHKAN INI

// ... (Impor service lain yang sudah ada)
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService'); // songsService sudah ada
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');

// Impor service playlist BARU
const PlaylistsService = require('./services/postgres/PlaylistsService'); // <--- TAMBAHKAN INI

// ... (Impor validator lain yang sudah ada)
const AlbumValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');

// Impor validator playlist BARU
const PlaylistsValidator = require('./validator/playlists'); // <--- TAMBAHKAN INI

const TokenManager = require('./tokenize/TokenManager');
const ClientError = require('./exceptions/ClientError');
// Pastikan AuthorizationError juga diimpor jika belum (meskipun biasanya tidak diimpor langsung di server.js)
// const AuthorizationError = require('./exceptions/AuthorizationError'); 

const init = async () => {
  // ... (Inisialisasi service lain yang sudah ada)
  const albumsService = new AlbumsService();
  const songsService = new SongsService(); // songsService sudah ada
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  // Inisialisasi PlaylistsService dengan songsService
  const playlistsService = new PlaylistsService(songsService); // <--- MODIFIKASI/TAMBAHKAN INI

const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // ... (server.ext('onPreResponse', ...) dan server.auth.strategy(...) tetap sama)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) { // Ini akan menangani NotFoundError, InvariantError, AuthorizationError
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });


  await server.register([
    // ... (Plugin lain yang sudah ada)
    {
      plugin: AlbumsPlugin,
      options: { service: albumsService, validator: AlbumValidator },
    },
    {
      plugin: SongsPlugin,
      options: { service: songsService, validator: SongsValidator },
    },
    {
      plugin: users,
      options: { service: usersService, validator: UsersValidator },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    // Daftarkan plugin playlist BARU
    {
      plugin: playlists, // <--- TAMBAHKAN INI
      options: {
        playlistsService, // Instance PlaylistsService yang sudah diinject songsService
        songsService, // Tetap inject songsService jika dibutuhkan langsung oleh handler/validator di masa depan (opsional)
        validator: PlaylistsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();