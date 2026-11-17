require('dotenv').config();

const { Pool } = require('pg');

function parsePostgresUrl(urlString) {
  if (!urlString) {
    return null;
  }

  try {
    const parsed = new URL(urlString);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : '',
      user: decodeURIComponent(parsed.username || ''),
      password: decodeURIComponent(parsed.password || ''),
    };
  } catch (_error) {
    return null;
  }
}

function getDbConfigFromEnv() {
  const preferredUrl =
    process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGURL;
  const urlConfig = parsePostgresUrl(preferredUrl);

  const target =
    String(process.env.DB_TARGET || 'local').toLowerCase() === 'prod'
      ? 'PROD'
      : 'TEST';
  const scopedUrlConfig = parsePostgresUrl(
    process.env[`POSTGRES_${target}_URL`] || process.env[`PG_${target}_URL`],
  );

  const host =
    process.env[`POSTGRES_${target}_HOST`] ||
    process.env[`PG_${target}_HOST`] ||
    process.env.POSTGRES_HOST ||
    process.env.PGHOST ||
    (urlConfig && urlConfig.host) ||
    'localhost';
  const port = Number(
    process.env[`POSTGRES_${target}_PORT`] ||
      process.env[`PG_${target}_PORT`] ||
      process.env.POSTGRES_PORT ||
      process.env.PGPORT ||
      (urlConfig && urlConfig.port) ||
      5432,
  );
  const user =
    process.env[`POSTGRES_${target}_USER`] ||
    process.env[`PG_${target}_USER`] ||
    process.env.POSTGRES_USER ||
    process.env.PGUSER ||
    (urlConfig && urlConfig.user) ||
    'postgres';
  const password =
    process.env[`POSTGRES_${target}_PASSWORD`] ||
    process.env[`PG_${target}_PASSWORD`] ||
    process.env.POSTGRES_PASSWORD ||
    process.env.PGPASSWORD ||
    (urlConfig && urlConfig.password) ||
    'postgres';
  const database =
    process.env[`POSTGRES_${target}_DATABASE`] ||
    process.env[`PG_${target}_DATABASE`] ||
    process.env.POSTGRES_DB ||
    process.env.PGDATABASE ||
    (urlConfig && urlConfig.database) ||
    'housetab';

  return { host, port, user, password, database };
}

const dbConfig = getDbConfigFromEnv();

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

module.exports = { pool };
