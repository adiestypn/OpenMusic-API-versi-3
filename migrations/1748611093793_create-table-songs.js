export function up(pgm) {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: false, 
    },
    duration: {
      type: 'INTEGER',
      notNull: false, 
    },
    album_id: { 
      type: 'VARCHAR(50)',
      notNull: false, 
    },
    inserted_at: { 
      type: 'TEXT', 
    },
    updated_at: { 
      type: 'TEXT', 
      notNull: true,
    },
  });

  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', {
    foreignKeys: {
      columns: 'album_id',
      references: 'albums(id)', 
      onDelete: 'SET NULL',    
                               
    },
  });
}

export function down(pgm) {

  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');

  pgm.dropTable('songs');
}