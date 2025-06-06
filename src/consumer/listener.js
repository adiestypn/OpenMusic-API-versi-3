class Listener {
  /**
   * Konstruktor untuk Listener.
   * @param {object} playlistsService - Layanan untuk mengakses data playlist dari database.
   * @param {object} mailSender - Layanan untuk mengirim email.
   */
  constructor(playlistsService, mailSender) {
    // Mengubah dependensi dari notesService menjadi playlistsService
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;
 
    this.listen = this.listen.bind(this);
  }
 
  /**
   * Metode untuk mendengarkan dan memproses pesan dari message queue.
   * @param {object} message - Pesan yang diterima dari RabbitMQ.
   */
  async listen(message) {
    try {
      // Mengharapkan playlistId dan targetEmail dari pesan
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      
      // Mengambil detail playlist beserta lagu-lagunya
      const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

      // Memformat data untuk attachment email
      const data = {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          songs: playlist.songs,
        },
      };
      
      // Mengirim email dengan data playlist
      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(data));
      console.log(`Email ekspor untuk playlist ${playlistId} berhasil dikirim.`);
      console.log(result);
    } catch (error) {
      console.error(`Gagal memproses pesan ekspor: ${error.message}`);
    }
  }
}
 
module.exports = Listener;
