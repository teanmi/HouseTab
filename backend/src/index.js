require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');
const { runMigrations } = require('./migrations');
const AccountService = require('./services/accountService');
const HouseService = require('./services/houseService');
const ExpenseService = require('./services/expenseService');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET;
const AUTO_MIGRATE =
  String(process.env.AUTO_MIGRATE || 'false').toLowerCase() === 'true';

const allowedOrigins = [
  'https://housetabapp.com',
  'https://www.housetabapp.com',
  'https://api.housetabapp.com',

  // Local development origins:
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || __DEV__) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const accountService = new AccountService(pool);

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

app.post('/auth/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [payload.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    const nextToken = signToken(user);

    return res.json({ token: nextToken, user });
  } catch (error) {
    console.error('Refresh token error:', error);
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
// Privacy Policy Endpoint
// ============================================================================

app.get('/privacy-policy', (_req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

app.get('/delete-account', (_req, res) => {
  res.sendFile(path.join(__dirname, 'delete-account.html'));
});

app.post('/delete-account', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    await accountService.deleteAccountByCredentials(email, password);

    return res.status(200).json({
      success: true,
      message: 'Your account has been deleted successfully.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete account',
    });
  }
});

// ============================================================================
// HOUSE ENDPOINTS
// ============================================================================

const houseService = new HouseService(pool);
const expenseService = new ExpenseService(pool);

const ALLOWED_SPLIT_TYPES = new Set(['everyone', 'individual', 'none']);
const ALLOWED_EXPENSE_TYPES = new Set(['expense', 'settlement']);

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parseExpensePayload(body) {
  const rawName = body?.name ?? body?.title;
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (!name) {
    return { error: 'Expense name is required' };
  }

  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number' };
  }

  const paidBy = typeof body?.paidBy === 'string' ? body.paidBy.trim() : '';
  if (!paidBy) {
    return { error: 'Paid by is required' };
  }

  const splitType = body?.splitType || 'everyone';
  if (!ALLOWED_SPLIT_TYPES.has(splitType)) {
    return { error: 'Invalid split type' };
  }

  let splitWith = [];
  if (body?.splitWith !== undefined) {
    if (!Array.isArray(body.splitWith)) {
      return { error: 'Split with must be an array' };
    }
    splitWith = body.splitWith
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value.trim());
  }

  const type = body?.type || 'expense';
  if (!ALLOWED_EXPENSE_TYPES.has(type)) {
    return { error: 'Invalid expense type' };
  }

  let expenseDate = null;
  if (body?.date) {
    expenseDate = new Date(body.date);
    if (Number.isNaN(expenseDate.getTime())) {
      return { error: 'Invalid date' };
    }
  }

  let category = null;
  if (body?.category !== undefined && body?.category !== null) {
    if (typeof body.category !== 'string') {
      return { error: 'Category must be a string' };
    }
    category = body.category.trim() || null;
  }

  return {
    value: {
      name,
      amount,
      paidBy,
      splitType,
      splitWith,
      expenseDate,
      category,
      type,
    },
  };
}

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

// ============================================================================
// EXPENSE ENDPOINTS
// ============================================================================

/**
 * GET /expenses?houseId=123 - Get all expenses for a house
 * Returns: { expenses: Array }
 */
app.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const houseId = parsePositiveInt(req.query.houseId);

    if (!houseId) {
      return res.status(400).json({ message: 'houseId is required' });
    }

    const isMember = await houseService.isUserMember(req.user.id, houseId);
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this house' });
    }

    const expenses = await expenseService.getExpensesByHouse(houseId);
    return res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

/**
 * POST /expenses - Create a new expense
 * Body: { houseId, name/title, amount, paidBy, splitType, splitWith?, date?, category?, type? }
 * Returns: { expense: Object }
 */
app.post('/expenses', authMiddleware, async (req, res) => {
  try {
    const houseId = parsePositiveInt(req.body?.houseId);
    if (!houseId) {
      return res.status(400).json({ message: 'houseId is required' });
    }

    const isMember = await houseService.isUserMember(req.user.id, houseId);
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this house' });
    }

    const parsed = parseExpensePayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const expense = await expenseService.createExpense({
      houseId,
      createdBy: req.user.id,
      ...parsed.value,
    });

    return res.status(201).json({ expense });
  } catch (error) {
    console.error('Create expense error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to create expense' });
  }
});

/**
 * PUT /expenses/:id - Update an expense
 * Body: { houseId, name/title, amount, paidBy, splitType, splitWith?, date?, category?, type? }
 * Returns: { expense: Object }
 */
app.put('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expenseId = parsePositiveInt(req.params.id);
    if (!expenseId) {
      return res.status(400).json({ message: 'Invalid expense id' });
    }

    const houseId = parsePositiveInt(req.body?.houseId);
    if (!houseId) {
      return res.status(400).json({ message: 'houseId is required' });
    }

    const isMember = await houseService.isUserMember(req.user.id, houseId);
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this house' });
    }

    const parsed = parseExpensePayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const expense = await expenseService.updateExpense(expenseId, houseId, parsed.value);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ expense });
  } catch (error) {
    console.error('Update expense error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to update expense' });
  }
});

/**
 * DELETE /expenses/:id?houseId=123 - Delete an expense
 * Returns: { success: true }
 */
app.delete('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expenseId = parsePositiveInt(req.params.id);
    if (!expenseId) {
      return res.status(400).json({ message: 'Invalid expense id' });
    }

    const houseId = parsePositiveInt(req.query.houseId);
    if (!houseId) {
      return res.status(400).json({ message: 'houseId is required' });
    }

    const isMember = await houseService.isUserMember(req.user.id, houseId);
    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this house' });
    }

    const deleted = await expenseService.deleteExpense(expenseId, houseId);
    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to delete expense' });
  }
});

async function startServer() {
  try {
    if (AUTO_MIGRATE) {
      await runMigrations(pool);
      console.log('Auto-migrations complete.');
    }

    app.listen(PORT, HOST, () => {
      console.log(`--- HouseTab Backend Active ---`);
      console.log(`Internal: http://${HOST}:${PORT}`);
      console.log(`External: https://api.housetabapp.com`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
