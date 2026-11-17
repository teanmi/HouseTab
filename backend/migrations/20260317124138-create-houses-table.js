module.exports = {
  async up(pool) {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS houses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                join_code VARCHAR(10) UNIQUE NOT NULL,
                created_by INTEGER NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS houses');
  },
};
