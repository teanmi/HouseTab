module.exports = {
  async up(pool) {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS house_members (
                id SERIAL PRIMARY KEY,
                house_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
                joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(house_id, user_id),
                FOREIGN KEY (house_id) REFERENCES houses(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS house_members');
  },
};
