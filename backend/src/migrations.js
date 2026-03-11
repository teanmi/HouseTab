const fs = require('fs');
const path = require('path');

async function ensureMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function getMigrationFiles() {
  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.js'))
    .sort()
    .map((file) => ({
      name: file,
      fullPath: path.join(migrationsDir, file),
    }));
}

async function runMigrations(pool) {
  await ensureMigrationsTable(pool);

  const [appliedRows] = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.name));
  const migrationFiles = getMigrationFiles();

  for (const migrationFile of migrationFiles) {
    if (applied.has(migrationFile.name)) {
      continue;
    }

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const migration = require(migrationFile.fullPath);

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${migrationFile.name} must export an up(pool) function`);
    }

    await migration.up(pool);
    await pool.query('INSERT INTO schema_migrations (name) VALUES (?)', [migrationFile.name]);
    console.log(`Applied migration: ${migrationFile.name}`);
  }
}

module.exports = {
  runMigrations,
};
