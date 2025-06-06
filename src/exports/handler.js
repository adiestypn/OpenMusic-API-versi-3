const ClientError = require('../exceptions/ClientError');

class ExportsHandler {
  constructor(service, validator, playlistsService) { // Tambahkan playlistsService
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService; // Tambahkan playlistsService

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.this.postExportPlaylistsHandler(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { targetEmail } = request.payload;

    // Verifikasi kepemilikan playlist sebelum mengirim pesan
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId, // Kirim playlistId
      targetEmail,
    };

    // Pastikan queue yang digunakan adalah 'export:playlists' atau sejenisnya
    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;