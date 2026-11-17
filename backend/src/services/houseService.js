const {
  generateJoinCode,
  isValidJoinCode,
  normalizeJoinCode,
} = require('../utils/codeGenerator');

// Service for managing houses and memberships
class HouseService {
  constructor(pool) {
    this.pool = pool;
  }

  // Creates a new house with a unique join code and adds the creator as owner
  async createHouse(userId, houseName) {
    if (!houseName || typeof houseName !== 'string') {
      throw new Error('House name is required');
    }

    let joinCode;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    // Generate unique code with retry logic
    while (!isUnique && attempts < MAX_ATTEMPTS) {
      joinCode = generateJoinCode();
      const { rows: existing } = await this.pool.query(
        'SELECT id FROM houses WHERE join_code = $1',
        [joinCode],
      );
      isUnique = existing.length === 0;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique join code');
    }

    const result = await this.pool.query(
      'INSERT INTO houses (name, join_code, created_by) VALUES ($1, $2, $3) RETURNING id',
      [houseName.trim(), joinCode, userId],
    );

    // Add creator as owner
    await this.pool.query(
      'INSERT INTO house_members (house_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, userId, 'owner'],
    );

    return {
      id: result.rows[0].id,
      name: houseName.trim(),
      join_code: joinCode,
      created_by: userId,
    };
  }

  // Gets house details by ID, including member count
  async getHouseById(houseId) {
    const { rows: houses } = await this.pool.query(
      `SELECT id, name, join_code, created_by, created_at,
              (SELECT COUNT(*) FROM house_members WHERE house_id = houses.id) as member_count
       FROM houses WHERE id = $1`,
      [houseId],
    );

    if (houses.length === 0) {
      return null;
    }

    return houses[0];
  }

  // Gets all houses a user is a member of, with their role and member count
  async getUserHouses(userId) {
    const { rows: houses } = await this.pool.query(
      `SELECT h.id, h.name, h.join_code, h.created_by, h.created_at,
              hm.role,
              (SELECT COUNT(*) FROM house_members WHERE house_id = h.id) as member_count
       FROM houses h
       INNER JOIN house_members hm ON h.id = hm.house_id
       WHERE hm.user_id = $1
       ORDER BY h.created_at DESC`,
      [userId],
    );

    return houses;
  }

  // Joins a house using a join code
  async joinHouseByCode(userId, joinCode) {
    // Normalize and validate the code
    const normalizedCode = normalizeJoinCode(joinCode);
    if (!normalizedCode) {
      throw new Error(
        'Invalid join code format. Code must be 6 alphanumeric characters.',
      );
    }

    // Find house by normalized code
    const { rows: houses } = await this.pool.query(
      'SELECT id, name, join_code FROM houses WHERE join_code = $1',
      [normalizedCode],
    );

    if (houses.length === 0) {
      throw new Error('House not found. Please check your code and try again.');
    }

    const house = houses[0];

    // Check if user is already a member
    const { rows: existing } = await this.pool.query(
      'SELECT id FROM house_members WHERE house_id = $1 AND user_id = $2',
      [house.id, userId],
    );

    if (existing.length > 0) {
      throw new Error('You are already a member of this house');
    }

    // Add user to house
    await this.pool.query(
      'INSERT INTO house_members (house_id, user_id, role) VALUES ($1, $2, $3)',
      [house.id, userId, 'member'],
    );

    return {
      id: house.id,
      name: house.name,
      join_code: house.join_code,
      message: 'Successfully joined house',
    };
  }

  // Gets members of a house with their roles
  async getHouseMembers(houseId) {
    const { rows: members } = await this.pool.query(
      `SELECT u.id, u.name, u.email, hm.role, hm.joined_at
       FROM house_members hm
       INNER JOIN users u ON hm.user_id = u.id
       WHERE hm.house_id = $1
       ORDER BY hm.role DESC, u.name ASC`,
      [houseId],
    );

    return members;
  }

  // Checks if a user is a member of a house
  async isUserMember(userId, houseId) {
    const { rows } = await this.pool.query(
      'SELECT id FROM house_members WHERE house_id = $1 AND user_id = $2',
      [houseId, userId],
    );

    return rows.length > 0;
  }

  // Regenerates the join code for a house (owner only)
  async regenerateJoinCode(houseId, userId) {
    // Verify user is owner
    const { rows: owner } = await this.pool.query(
      'SELECT id FROM house_members WHERE house_id = $1 AND user_id = $2 AND role = $3',
      [houseId, userId, 'owner'],
    );

    if (owner.length === 0) {
      throw new Error('Only house owner can regenerate join code');
    }

    let newCode;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
      newCode = generateJoinCode();
      const { rows: existing } = await this.pool.query(
        'SELECT id FROM houses WHERE join_code = $1',
        [newCode],
      );
      isUnique = existing.length === 0;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique join code');
    }

    await this.pool.query('UPDATE houses SET join_code = $1 WHERE id = $2', [
      newCode,
      houseId,
    ]);

    return newCode;
  }
}

module.exports = HouseService;
