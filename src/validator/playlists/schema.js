// src/validator/playlists/schema.js
const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(), // Asumsi songId adalah string
});

// Skema untuk DeleteSongFromPlaylistPayload sama dengan PostSongToPlaylistPayload
const DeleteSongFromPlaylistPayloadSchema = PostSongToPlaylistPayloadSchema;

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
};