/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export function up(pgm) {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export function down(pgm) {
  pgm.dropTable('albums');
}