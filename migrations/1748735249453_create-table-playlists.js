exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(255)', // VARCHAR mungkin lebih cocok untuk nama dari TEXT jika ada batasan panjang
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Tambahkan foreign key constraint ke tabel users
  // Pastikan tabel 'users' dan kolom 'id' di users sudah ada
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE', // Jika user dihapus, playlistnya juga ikut terhapus
    },
  });
};

exports.down = (pgm) => {
  // Hapus constraint dulu sebelum drop table
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
  pgm.dropTable('playlists');
};