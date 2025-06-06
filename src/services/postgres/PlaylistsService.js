const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError'); 

class PlaylistsService {
  constructor(songsService) { 
    this._pool = new Pool();
    this._songsService = songsService; 
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p
             LEFT JOIN users u ON u.id = p.owner
             WHERE p.owner = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
        text: `SELECT p.id, p.name, u.username
               FROM playlists p
               LEFT JOIN users u ON u.id = p.owner 
               WHERE p.id = $1`,
        values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }


  async deletePlaylistById(id, owner) {
    await this.verifyPlaylistOwner(id, owner); 
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addSongToPlaylist(playlistId, songId, owner) {
    await this.verifyPlaylistOwner(playlistId, owner); 

    try {
        await this._songsService.getSongById(songId); 
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw new NotFoundError('Lagu gagal ditambahkan ke playlist. Lagu tidak ditemukan.');
        }
        throw error; 
    }
    
    const id = `playlistsong-${nanoid(16)}`; 
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    try {
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }
    } catch (error) {
        if (error.code === '23505') { 
            throw new InvariantError('Lagu sudah ada di dalam playlist ini.');
        }
        throw new InvariantError(`Lagu gagal ditambahkan ke playlist: ${error.message}`);
    }
  }

  async getSongsFromPlaylist(playlistId, owner) {
    await this.verifyPlaylistOwner(playlistId, owner); 

    const playlistQuery = {
        text: `SELECT p.id, p.name, u.username
               FROM playlists p
               LEFT JOIN users u ON u.id = p.owner
               WHERE p.id = $1`,
        values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlistDetails = playlistResult.rows[0];

    const songsQuery = {
        text: `SELECT s.id, s.title, s.performer 
               FROM songs s
               JOIN playlist_songs ps ON s.id = ps.song_id
               WHERE ps.playlist_id = $1`,
        values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);
    
    playlistDetails.songs = songsResult.rows;
    return playlistDetails;
  }

   // --- METODE BARU YANG AMAN UNTUK CONSUMER ---
  async getPlaylistForExport(playlistId) {
    const playlistQuery = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan untuk diekspor');
    }

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s
             JOIN playlist_songs ps ON s.id = ps.song_id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;

    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId, owner) {
    await this.verifyPlaylistOwner(playlistId, owner); 
   
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Lagu tidak ditemukan di playlist ini.');
    }
  }
}

module.exports = PlaylistsService;