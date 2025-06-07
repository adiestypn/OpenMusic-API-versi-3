const autoBind = require('auto-bind');

class UploadImageHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
    autoBind(this);
  }

async postUploadImageHandler(request, h) {
  const { id } = request.params;
  const { cover } = request.payload;

  // 🔍 Ensure album exists
  await this._albumsService.getAlbumById(id);

  this._validator.validateImageHeaders(cover.hapi.headers);

  const filename = await this._storageService.writeFile(cover, cover.hapi);
  const url = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;

  await this._albumsService.addAlbumCover(id, url);

  const response = h.response({
    status: 'success',
    message: 'Cover album berhasil ditambahkan',
  });
  response.code(201);
  return response;
}
}

module.exports = UploadImageHandler;