const bcrypt = require('bcryptjs');

class AccountService {
  constructor(pool) {
    this.pool = pool;
  }

  async deleteAccountByCredentials(email, password) {
    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();
    const rawPassword = String(password || '');

    if (!normalizedEmail || !rawPassword) {
      throw new Error('Email and password are required');
    }

    const connection = await this.pool.connect();

    try {
      await connection.query('BEGIN');

      const { rows: users } = await connection.query(
        'SELECT id, password_hash FROM users WHERE email = $1 FOR UPDATE',
        [normalizedEmail],
      );

      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(
        rawPassword,
        user.password_hash,
      );

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const { rows: ownedHouses } = await connection.query(
        `SELECT h.id
         FROM houses h
         INNER JOIN house_members hm ON hm.house_id = h.id
         WHERE hm.user_id = $1 AND hm.role = 'owner'
         FOR UPDATE`,
        [user.id],
      );

      for (const house of ownedHouses) {
        const { rows: candidates } = await connection.query(
          `SELECT hm.user_id
           FROM house_members hm
           INNER JOIN users u ON u.id = hm.user_id
           WHERE hm.house_id = $1 AND hm.user_id <> $2 AND u.deleted_at IS NULL
           ORDER BY hm.joined_at ASC, hm.id ASC
           LIMIT 1`,
          [house.id, user.id],
        );

        if (candidates.length > 0) {
          const newOwnerId = candidates[0].user_id;

          await connection.query(
            'UPDATE houses SET created_by = $1 WHERE id = $2',
            [newOwnerId, house.id],
          );
          await connection.query(
            "UPDATE house_members SET role = 'owner' WHERE house_id = $1 AND user_id = $2",
            [house.id, newOwnerId],
          );
        } else {
          await connection.query(
            'DELETE FROM house_members WHERE house_id = $1',
            [house.id],
          );
          await connection.query('DELETE FROM houses WHERE id = $1', [
            house.id,
          ]);
        }
      }

      await connection.query('DELETE FROM house_members WHERE user_id = $1', [
        user.id,
      ]);
      await connection.query('DELETE FROM users WHERE id = $1', [user.id]);

      await connection.query('COMMIT');

      return {
        success: true,
        deletedUserId: user.id,
        deletedEmail: normalizedEmail,
      };
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = AccountService;
