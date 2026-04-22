module.exports = {
  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        house_id INT NOT NULL,
        created_by INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        paid_by VARCHAR(100) NOT NULL,
        split_type ENUM('everyone', 'individual', 'none') NOT NULL DEFAULT 'everyone',
        split_with JSON NULL,
        expense_date DATETIME NULL,
        category VARCHAR(100) NULL,
        expense_type ENUM('expense', 'settlement') NOT NULL DEFAULT 'expense',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_expenses_house_id (house_id),
        FOREIGN KEY (house_id) REFERENCES houses(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS expenses');
  },
};
