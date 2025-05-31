exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)', // Atau SERIAL jika ingin auto-increment integer ID untuk relasi ini
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Foreign Key ke tabel playlists
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE', // Jika playlist dihapus, entri lagu di playlist itu juga hilang
    },
  });

  // Foreign Key ke tabel songs
  // Pastikan tabel 'songs' dan kolom 'id' di songs sudah ada
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE', // Jika lagu dihapus, entri lagu di playlist itu juga hilang
    },
  });

  // Optional: Menambahkan unique constraint agar lagu yang sama tidak bisa ditambahkan berulang kali ke playlist yang sama
  pgm.addConstraint('playlist_songs', 'unique_playlist_id_song_id', {
    unique: ['playlist_id', 'song_id'],
  });
};

exports.down = (pgm) => {
  // Hapus constraint dulu sebelum drop table
  pgm.dropConstraint('playlist_songs', 'unique_playlist_id_song_id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id');
  pgm.dropTable('playlist_songs');
};