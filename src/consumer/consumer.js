require('dotenv').config();
const amqp = require('amqplib');

const PlaylistsService = require('../services/postgres/PlaylistsService');
const SongsService = require('../services/postgres/SongsService'); 
const MailSender = require('./MailSender');
const Listener = require('./listener');
 
const init = async () => {
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(songsService); 
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender); 
 
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  const queue = 'export:playlists';
  await channel.assertQueue(queue, {
    durable: true,
  });

  channel.consume(queue, listener.listen, { noAck: true });

  console.log(`Consumer sedang berjalan, menunggu pesan di queue "${queue}"...`);
};
 
init();
