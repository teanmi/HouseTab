const fs = require('fs');
const path = require('path');

function toSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function timestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

function main() {
  const rawName = process.env.npm_config_name;
  const name = toSlug(rawName);

  if (!name) {
    console.error('Usage: npm run migrate:create --name=describe-change');
    process.exit(1);
  }

  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const fileName = `${timestamp()}-${name}.js`;
  const filePath = path.join(migrationsDir, fileName);

  const content = `module.exports = {
  async up(pool) {
    // Write migration SQL here.
    // Example:
    // await pool.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL');
  },

  async down(pool) {
    // Write rollback SQL here (optional but recommended).
  },
};
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created migration: ${fileName}`);
}

main();
