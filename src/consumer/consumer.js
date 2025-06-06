require('dotenv').config();
const amqp = require('amqplib');

// Mengimpor layanan yang benar dari direktori services
const PlaylistsService = require('../services/postgres/PlaylistsService');
const SongsService = require('../services/postgres/SongsService'); // PlaylistsService memerlukan SongsService
const MailSender = require('./MailSender');
const Listener = require('./listener');
 
const init = async () => {
  // Membuat instance dari layanan yang benar
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(songsService); // Menginject songsService
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender); // Menginject playlistsService ke Listener
 
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  // Mendengarkan dari queue yang benar
  const queue = 'export:playlists';
  await channel.assertQueue(queue, {
    durable: true,
  });

  // Mengonsumsi pesan dari queue yang benar
  channel.consume(queue, listener.listen, { noAck: true });

  console.log(`Consumer sedang berjalan, menunggu pesan di queue "${queue}"...`);
};
 
init();
