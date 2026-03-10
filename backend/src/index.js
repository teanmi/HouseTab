require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

app.use(cors());
app.use(express.json());

// async function initDatabase() {
//     await pool.query(`
//         CREATE TABLE IF NOT EXISTS users (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             name VARCHAR(100) NOT NULL,
//             email VARCHAR(255) NOT NULL UNIQUE,
//             password_hash VARCHAR(255) NOT NULL,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )
//     `);
//     console.log('Database initialized (users table ready).');
// }

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

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
