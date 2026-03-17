require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');
const { runMigrations } = require('./migrations');
const HouseService = require('./services/houseService');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET;
const AUTO_MIGRATE = String(process.env.AUTO_MIGRATE || 'false').toLowerCase() === 'true';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

app.get('/', (_req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail],
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [String(name).trim(), normalizedEmail, password_hash],
    );

    const user = {
      id: result.insertId,
      name: String(name).trim(),
      email: normalizedEmail,
    };
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [normalizedEmail],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const dbUser = rows[0];
    const isValidPassword = await bcrypt.compare(
      String(password),
      dbUser.password_hash,
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
    };
    const token = signToken(user);

    return res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.user.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// HOUSE ENDPOINTS
// ============================================================================

const houseService = new HouseService(pool);

/**
 * POST /houses - Create a new house
 * Body: { name: string }
 * Returns: { id, name, join_code, created_by }
 */
app.post('/houses', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'House name is required' });
    }

    const house = await houseService.createHouse(req.user.id, name);
    return res.status(201).json({ house });
  } catch (error) {
    console.error('Create house error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to create house' });
  }
});

/**
 * POST /houses/join - Join a house using join code
 * Body: { join_code: string }
 * Returns: { house: Object }
 */
app.post('/houses/join', authMiddleware, async (req, res) => {
  try {
    const joinCode = req.body?.join_code;

    if (!joinCode || typeof joinCode !== 'string') {
      console.error('Invalid join_code in request body:', {
        body: req.body,
        join_code: joinCode,
      });
      return res.status(400).json({ message: 'Join code is required and must be a string' });
    }

    const house = await houseService.joinHouseByCode(req.user.id, joinCode);
    return res.status(200).json({ house, success: true });
  } catch (error) {
    console.error('Join house error:', error);
    const statusCode = error.message.includes('already a member') ? 409 : 400;
    return res
      .status(statusCode)
      .json({ message: error.message || 'Failed to join house' });
  }
});

/**
 * POST /houses/:id/regenerate-code - Regenerate join code (owner only)
 * Returns: { join_code: string }
 */
app.post('/houses/:id/regenerate-code', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const newJoinCode = await houseService.regenerateJoinCode(id, req.user.id);
    return res.json({ join_code: newJoinCode });
  } catch (error) {
    console.error('Regenerate code error:', error);
    const statusCode = error.message.includes('owner') ? 403 : 500;
    return res
      .status(statusCode)
      .json({ message: error.message || 'Failed to regenerate code' });
  }
});

/**
 * GET /houses - Get all houses for current user
 * Returns: { houses: Array }
 */
app.get('/houses', authMiddleware, async (req, res) => {
  try {
    const houses = await houseService.getUserHouses(req.user.id);
    return res.json({ houses });
  } catch (error) {
    console.error('Get houses error:', error);
    return res.status(500).json({ message: 'Failed to fetch houses' });
  }
});

/**
 * GET /houses/:id - Get house details with members
 * Returns: { house: Object, members: Array }
 */
app.get('/houses/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is member of this house
    const isMember = await houseService.isUserMember(req.user.id, id);
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this house' });
    }

    const house = await houseService.getHouseById(id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    const members = await houseService.getHouseMembers(id);

    return res.json({ house, members });
  } catch (error) {
    console.error('Get house error:', error);
    return res.status(500).json({ message: 'Failed to fetch house' });
  }
});

async function startServer() {
  try {
    if (AUTO_MIGRATE) {
      await runMigrations(pool);
      console.log('Auto-migrations complete.');
    }

    app.listen(PORT, HOST, () => {
      const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : null;

      console.log(`Server listening on ${HOST}:${PORT}`);
      if (railwayUrl) {
        console.log(`Public URL: ${railwayUrl}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
