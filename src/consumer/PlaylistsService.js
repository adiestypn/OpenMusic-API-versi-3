const { Pool } = require('pg');
const NotFoundError = require('../exceptions/NotFoundError');

/**
 * Kelas ini bertanggung jawab untuk mengelola data playlist dari database,
 * khusus untuk keperluan consumer.
 */
class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Mengambil detail sebuah playlist beserta lagu-lagu di dalamnya.
   * Metode ini tidak memerlukan verifikasi pemilik karena dijalankan oleh consumer
   * setelah permintaan divalidasi oleh API utama.
   *
   * @param {string} playlistId - ID dari playlist yang akan diambil datanya.
   * @returns {object} Objek yang berisi detail playlist dan daftar lagu.
   */
  async getPlaylistForExport(playlistId) {
    // 1. Mengambil detail playlist (id dan nama)
    const playlistQuery = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    // 2. Mengambil semua lagu yang ada di dalam playlist tersebut
    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s
             INNER JOIN playlist_songs ps ON s.id = ps.song_id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    // 3. Menggabungkan hasil query menjadi struktur yang diinginkan
    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;

    return playlist;
  }
}

module.exports = PlaylistsService;
