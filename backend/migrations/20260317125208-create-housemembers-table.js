module.exports = {
    async up(pool) {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS house_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                house_id INT NOT NULL,
                user_id INT NOT NULL,
                role ENUM('owner','member') DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
