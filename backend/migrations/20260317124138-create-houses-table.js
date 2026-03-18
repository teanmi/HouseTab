module.exports = {
    async up(pool) {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS houses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                join_code VARCHAR(10) UNIQUE NOT NULL,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
    },

    async down(pool) {
        await pool.query('DROP TABLE IF EXISTS houses');
    },
};
