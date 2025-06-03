// Impor PlaylistsService jika belum ada (ini hanya contoh, sesuaikan dengan struktur Anda)
// const PlaylistsService = require('../services/postgres/PlaylistsService'); // Anda mungkin sudah menginjectnya melalui plugin

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    // producerService adalah instance dari ProducerService untuk RabbitMQ
    this._producerService = producerService;
    // playlistsService adalah instance dari PlaylistsService untuk verifikasi playlist
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    // 1. Validasi payload body (targetEmail)
    // Pastikan nama method ini (validateExportPlaylistsPayload) sesuai dengan yang ada di ExportsValidator Anda
    this._validator.validateExportPlaylistsPayload(request.payload);

    // 2. Ambil userId dari kredensial otentikasi
    const { id: userId } = request.auth.credentials;

    // 3. Ambil playlistId dari parameter path URL
    const { playlistId } = request.params;

    // 4. Ambil targetEmail dari payload body
    const { targetEmail } = request.payload;

    // 5. Verifikasi kepemilikan playlist (Kriteria: Hanya pemilik Playlist yang boleh mengekspor)
    // Metode verifyPlaylistOwner akan throw error jika user bukan pemilik,
    // yang akan ditangani oleh handler onPreResponse di server.js
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    // 6. Siapkan pesan untuk dikirim ke RabbitMQ
    // Kriteria: "Data yang dikirimkan dari program producer ke program consumer hanya PlaylistId."
    // Namun, consumer juga memerlukan targetEmail untuk mengirim email.
    // Kita akan mengirimkan objek yang minimal berisi playlistId dan targetEmail
    // agar consumer dapat melakukan tugasnya.
    const message = {
      playlistId, // Sesuai kriteria (sebagai data utama)
      targetEmail,  // Informasi tambahan yang dibutuhkan consumer
      userId,       // Opsional: bisa berguna untuk logging atau konteks di consumer
    };

    // 7. Kirim pesan ke antrian RabbitMQ
    // Nama antrian 'export:playlists' atau 'export:playlistsId' harus konsisten dengan consumer.
    // Mari kita gunakan 'export:playlists' sebagai contoh yang lebih umum.
    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    // 8. Kirim respons sukses ke client
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses', // Sesuai kriteria
    });
    response.code(201); // Status code 201 Created, sesuai kriteria
    return response;
  }
}

module.exports = ExportsHandler;
