const ClientError = require('../../exceptions/ClientError');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const { name, year } = payload;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new ClientError('Gagal menambahkan album. Mohon isi nama album', 400);
    }

    if (typeof year !== 'number') {
      throw new ClientError('Gagal menambahkan album. Tahun harus berupa angka', 400);
    }
  },
};

module.exports = AlbumValidator;
