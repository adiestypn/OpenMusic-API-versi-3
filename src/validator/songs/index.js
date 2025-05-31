const ClientError = require('../../exceptions/ClientError');
const SongValidator = {
  validateSongPayload: (payload) => {
    const { title, year, genre, performer } = payload;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new ClientError('Judul lagu wajib diisi', 400);
    }
    if (!year || typeof year !== 'number') {
      throw new ClientError('Tahun harus berupa angka', 400);
    }
    if (!genre || typeof genre !== 'string' || genre.trim() === '') {
      throw new ClientError('Genre wajib diisi', 400);
    }
    if (!performer || typeof performer !== 'string' || performer.trim() === '') {
      throw new ClientError('Performer wajib diisi', 400);
    }
  },
};

module.exports = SongValidator;
