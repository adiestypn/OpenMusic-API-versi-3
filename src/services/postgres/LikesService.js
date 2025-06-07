// src/services/postgres/LikesService.js

const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLikeToAlbum(userId, albumId) {
    // First, verify the album exists
    await this._verifyAlbumExists(albumId);

    // Check if the user has already liked the album
    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }
    
    // Invalidate the cache
    await this._cacheService.delete(`album:${albumId}:likes`);
  }

  async deleteLikeFromAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal batal menyukai. Anda belum menyukai album ini');
    }
    
    // Invalidate the cache
    await this._cacheService.delete(`album:${albumId}:likes`);
  }

  async getAlbumLikes(albumId) {
    try {
      // Try to get from cache first
      const likes = await this._cacheService.get(`album:${albumId}:likes`);
      return {
        likes: parseInt(likes, 10),
        fromCache: true,
      };
    } catch (error) {
      // If not in cache, get from the database
      await this._verifyAlbumExists(albumId);
      
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      // Save to cache
      await this._cacheService.set(`album:${albumId}:likes`, likes);

      return {
        likes,
        fromCache: false,
      };
    }
  }

  async _verifyAlbumExists(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = LikesService;