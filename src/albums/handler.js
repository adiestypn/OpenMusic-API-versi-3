const ClientError = require('../exceptions/ClientError'); 

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator; 
  }

  addAlbumHandler = async (request, h) => {
 
    if (this._validator && typeof this._validator.validateAlbumPayload === 'function') {
      this._validator.validateAlbumPayload(request.payload);
    } else {

      const { name, year } = request.payload;
      if (typeof name !== 'string' || name.trim() === '') {
        throw new ClientError('Gagal menambahkan album. Mohon isi nama album', 400);
      }
      if (typeof year !== 'number') {
        throw new ClientError('Gagal menambahkan album. Mohon isi tahun album dengan benar (angka)', 400);
      }
    }

    const albumId = await this._service.addAlbum(request.payload);

    return h.response({
      status: 'success',
      data: { albumId },
    }).code(201);
  };

  getAlbumByIdHandler = async (request, h) => {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: { album },
    };
  };

  editAlbumByIdHandler = async (request, h) => {

    if (this._validator && typeof this._validator.validateAlbumPayload === 'function') {
      this._validator.validateAlbumPayload(request.payload);
    } else {

      const { name, year } = request.payload;
      if (typeof name !== 'string' || name.trim() === '') {
        throw new ClientError('Gagal memperbarui album. Mohon isi nama album', 400);
      }
      if (typeof year !== 'number') {
        throw new ClientError('Gagal memperbarui album. Mohon isi tahun album dengan benar (angka)', 400);
      }
    }

    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  };

  deleteAlbumByIdHandler = async (request, h) => {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  };
}

module.exports = AlbumsHandler;