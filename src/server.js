require('dotenv').config();
const path = require('path');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');


// Plugins
const AlbumsPlugin = require('./albums');
const SongsPlugin = require('./songs');
const UsersPlugin = require('./users');
const AuthenticationsPlugin = require('./authentications');
const PlaylistsPlugin = require('./playlists');
const ExportsPlugin = require('./exports');
const UploadsPlugin = require('./uploads');

// Services
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService'); 
const LikesPlugin = require('./likes');
const LikesService = require('./services/postgres/LikesService');
// cache
const CacheService = require('./services/redis/CacheService');

// Validators
const AlbumValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlists');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');

// Token Manager & ClientError
const TokenManager = require('./tokenize/TokenManager');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();

  const storageService = new StorageService(path.resolve(__dirname, 'uploads/file/images')); 
  
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(songsService);
  const likesService = new LikesService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
      files: { // Tambahkan ini untuk menyajikan file dari direktori
        relativeTo: path.resolve(__dirname, 'uploads'),
      },
    },
  });

  // Daftarkan plugin Inert untuk menyajikan file statis
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Definisikan strategi autentikasi JWT
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

  // Daftarkan semua plugin Anda
  await server.register([
    {
        plugin: AlbumsPlugin,
        options: {
          service: albumsService,
          validator: AlbumValidator,
          storageService, // Teruskan storageService
          uploadsValidator: UploadsValidator, // Teruskan uploadsValidator
        },
    },
    {
      plugin: SongsPlugin,
      options: { service: songsService, validator: SongsValidator },
    },
    {
      plugin: UsersPlugin,
      options: { service: usersService, validator: UsersValidator },
    },
    {
      plugin: AuthenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: ExportsPlugin,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: UploadsPlugin,
      options: {
        storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
    { // <-- TAMBAHKAN BLOK INI
      plugin: LikesPlugin,
      options: {
        service: likesService,
      },
    },
  ]);
  
  // Handler untuk error
  server.ext('onPreResponse', (request, h) => {

    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: response.message,
        }).code(response.statusCode);
      }
      // 💡 Handle "Payload too large" (413) error
    if (
      response.output &&
      response.output.statusCode === 400 &&
      response.output.payload &&
      response.output.payload.message.includes('Payload content length greater than maximum allowed')
    ) {
      return h.response({
        status: 'fail',
        message: 'Payload content length greater than maximum allowed',
      }).code(413);
    }
      if (!response.isServer) {
        return h.continue;
      }
      console.error(response);
      return h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami.',
      }).code(500);
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();