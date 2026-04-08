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

    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [users] = await connection.query(
        'SELECT id, password_hash FROM users WHERE email = ? FOR UPDATE',
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

      const [ownedHouses] = await connection.query(
        `SELECT h.id
         FROM houses h
         INNER JOIN house_members hm ON hm.house_id = h.id
         WHERE hm.user_id = ? AND hm.role = 'owner'
         FOR UPDATE`,
        [user.id],
      );

      for (const house of ownedHouses) {
        const [candidates] = await connection.query(
          `SELECT hm.user_id
           FROM house_members hm
           INNER JOIN users u ON u.id = hm.user_id
           WHERE hm.house_id = ? AND hm.user_id <> ? AND u.deleted_at IS NULL
           ORDER BY hm.joined_at ASC, hm.id ASC
           LIMIT 1`,
          [house.id, user.id],
        );

        if (candidates.length > 0) {
          const newOwnerId = candidates[0].user_id;

          await connection.query(
            'UPDATE houses SET created_by = ? WHERE id = ?',
            [newOwnerId, house.id],
          );
          await connection.query(
            "UPDATE house_members SET role = 'owner' WHERE house_id = ? AND user_id = ?",
            [house.id, newOwnerId],
          );
        } else {
          await connection.query(
            'DELETE FROM house_members WHERE house_id = ?',
            [house.id],
          );
          await connection.query('DELETE FROM houses WHERE id = ?', [house.id]);
        }
      }

      await connection.query('DELETE FROM house_members WHERE user_id = ?', [
        user.id,
      ]);
      await connection.query('DELETE FROM users WHERE id = ?', [user.id]);

      await connection.commit();

      return {
        success: true,
        deletedUserId: user.id,
        deletedEmail: normalizedEmail,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = AccountService;
