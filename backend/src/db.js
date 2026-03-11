require('dotenv').config();

const mysql = require('mysql2/promise');

function parseMysqlUrl(urlString) {
  if (!urlString) {
    return null;
  }

  const parsed = new URL(urlString);
  return {
    host: parsed.hostname,
    user: decodeURIComponent(parsed.username || ''),
    password: decodeURIComponent(parsed.password || ''),
    database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : '',
    port: parsed.port ? Number(parsed.port) : 3306,
  };
}

function getDbConfigFromEnv() {
  // Railway runtime variables (inside Railway network)
  const railwayUrlConfig = parseMysqlUrl(process.env.MYSQL_URL || process.env.DATABASE_URL);
  if (process.env.MYSQLHOST || railwayUrlConfig) {
    return {
      host: process.env.MYSQLHOST || railwayUrlConfig.host,
      user: process.env.MYSQLUSER || railwayUrlConfig.user,
      password: process.env.MYSQLPASSWORD || railwayUrlConfig.password,
      database: process.env.MYSQLDATABASE || railwayUrlConfig.database,
      port: Number(process.env.MYSQLPORT || railwayUrlConfig.port || 3306),
    };
  }

  // Local fallback using scoped env vars
  const target = String(process.env.DB_TARGET || 'test').toLowerCase() === 'prod' ? 'PROD' : 'TEST';
  const scopedUrlConfig = parseMysqlUrl(process.env[`MYSQL_${target}_URL`]);

  return {
    host: process.env[`MYSQL_${target}_HOST`] || (scopedUrlConfig && scopedUrlConfig.host),
    user: process.env[`MYSQL_${target}_USER`] || (scopedUrlConfig && scopedUrlConfig.user),
    password: process.env[`MYSQL_${target}_PASSWORD`] || (scopedUrlConfig && scopedUrlConfig.password),
    database: process.env[`MYSQL_${target}_DATABASE`] || (scopedUrlConfig && scopedUrlConfig.database),
    port: Number(process.env[`MYSQL_${target}_PORT`] || (scopedUrlConfig && scopedUrlConfig.port) || 3306),
  };
}

const dbConfig = getDbConfigFromEnv();

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool };
