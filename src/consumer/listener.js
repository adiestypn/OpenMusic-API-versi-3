class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;
 
    this.listen = this.listen.bind(this);
  }
 
  async listen(message) {
    try {
      console.log(`[Consumer] Menerima pesan: ${message.content.toString()}`);
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      
      console.log(`[Consumer] Memulai ekspor untuk playlistId: ${playlistId}`);

      const playlist = await this._playlistsService.getPlaylistForExport(playlistId);
      console.log(`[Consumer] Data untuk playlist "${playlist.name}" berhasil diambil.`);

      const dataForEmail = {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          songs: playlist.songs,
        },
      };
      
      await this._mailSender.sendEmail(targetEmail, JSON.stringify(dataForEmail));
      console.log(`[OK] Email untuk playlist ${playlistId} berhasil dikirim ke ${targetEmail}`);
    } catch (error) {
      console.error(`[GAGAL] Gagal memproses pesan ekspor: ${error.message}`);
    }
  }
}
 
module.exports = Listener;
