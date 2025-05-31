require('dotenv').config();

const Hapi = require('@hapi/hapi');


const AlbumsPlugin = require('./albums/index');
const SongsPlugin = require('./songs');


const AlbumsService = require('./services/postgres/AlbumsService'); 
const SongsService = require('./services/postgres/SongsService');   


const AlbumValidator = require('./validator/albums'); 
const SongsValidator = require('./validator/songs');

const users = require('./users')
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) { 
        return h.response({
          status: 'fail',
          message: response.message,
        }).code(response.statusCode);
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

  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumValidator, 
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },

  {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();