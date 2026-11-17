module.exports = {
  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        house_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        paid_by VARCHAR(100) NOT NULL,
        split_type VARCHAR(20) NOT NULL DEFAULT 'everyone' CHECK (split_type IN ('everyone', 'individual', 'none')),
        split_with JSONB NULL,
        expense_date TIMESTAMPTZ NULL,
        category VARCHAR(100) NULL,
        expense_type VARCHAR(20) NOT NULL DEFAULT 'expense' CHECK (expense_type IN ('expense', 'settlement')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL DEFAULT NULL,
        FOREIGN KEY (house_id) REFERENCES houses(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_house_id ON expenses (house_id)
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS expenses');
  },
};
