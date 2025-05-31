class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  addSongHandler = async (request, h) => {
    this._validator.validateSongPayload(request.payload);
    const songId = await this._service.addSong(request.payload);

    return h.response({
      status: 'success',
      data: { songId },
    }).code(201);
  };

  getSongsHandler = async () => {
    const songs = await this._service.getSongs();
    return {
      status: 'success',
      data: { songs },
    };
  };

  getSongByIdHandler = async (request, h) => {
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: { song },
    };
  };

  editSongByIdHandler = async (request, h) => {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  };

  deleteSongByIdHandler = async (request, h) => {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  };
}

module.exports = SongsHandler;