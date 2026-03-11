require('dotenv').config();

const { pool } = require('./db');
const { runMigrations } = require('./migrations');

async function main() {
  try {
    await runMigrations(pool);
    console.log('Migrations complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
