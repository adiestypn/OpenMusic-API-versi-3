const ClientError = require('../exceptions/ClientError'); 

class AlbumsHandler {
  // MODIFIKASI: Terima storageService dan uploadsValidator
  constructor(service, validator, storageService, uploadsValidator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;
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

postAlbumCoverHandler = async (request, h) => {
  const { id } = request.params;
  const cover = request.payload;

  // Defensive check for file presence
  if (!cover || !cover.hapi || !cover.hapi.headers) {
    throw new ClientError('File sampul album tidak ditemukan atau formatnya salah', 400);
  }

  console.log('Actual file headers:', cover.hapi.headers);

  // Validate image headers
  this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

  // Continue to write file and update album cover
  const filename = await this._storageService.writeFile(cover, cover.hapi);
  const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;

  await this._service.addAlbumCover(id, fileUrl);

  return h.response({
    status: 'success',
    message: 'Sampul berhasil diunggah',
  }).code(201);
};
}

module.exports = AlbumsHandler;