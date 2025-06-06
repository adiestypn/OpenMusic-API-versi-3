class ExportsHandler {
  // Pastikan constructor menerima playlistsService
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;
 
    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }
 
  async postExportPlaylistsHandler(request, h) { 
    this._validator.validateExportPlaylistsPayload(request.payload);
    
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { targetEmail } = request.payload;

    // Langkah Kritis: Verifikasi kepemilikan playlist.
    // Ini akan gagal jika playlistsService tidak di-inject dengan benar dari server.js
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
 
    const message = {
      playlistId,
      targetEmail,
    };
 
    // Kirim pesan ke queue yang benar
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
