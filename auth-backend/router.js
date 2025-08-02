const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const router = express.Router();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW())',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Your account is blocked.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    await pool.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, last_seen, is_blocked FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

router.post('/delete-users', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = ANY($1)', [ids]);
    res.status(200).json({ message: 'Users deleted successfully' });
  } catch (err) {
    console.error('Error deleting users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/block-users', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }

  try {
    await pool.query('UPDATE users SET is_blocked = TRUE WHERE id = ANY($1)', [ids]);
    res.status(200).json({ message: 'Users blocked successfully' });
  } catch (err) {
    console.error('Error blocking users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/unblock-users', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }

  try {
    await pool.query('UPDATE users SET is_blocked = FALSE WHERE id = ANY($1)', [ids]);
    res.status(200).json({ message: 'Users unblocked successfully' });
  } catch (err) {
    console.error('Error unblocking users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;