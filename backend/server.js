import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'golfcharitysuperscret2024';
const DRAW_PRIZE_TIERS = [
  { matchType: '5-Number', share: 0.4 },
  { matchType: '4-Number', share: 0.35 },
  { matchType: '3-Number', share: 0.25 },
];

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'golf_charity_subscription_platform',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Successfully connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

// Ensure new tables exist
async function ensureTables() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS charities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        members INT DEFAULT 0,
        contributions DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        description TEXT,
        category VARCHAR(100) DEFAULT 'Community',
        location VARCHAR(255),
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        plan ENUM('Monthly', 'Yearly') DEFAULT 'Monthly',
        charity_id INT,
        charity_contribution_pct INT DEFAULT 10,
        status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
        role ENUM('user', 'admin') DEFAULT 'user',
        otp_code VARCHAR(10),
        otp_expiry DATETIME,
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        score INT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS draws (
        id INT AUTO_INCREMENT PRIMARY KEY,
        draw_date DATE NOT NULL,
        prize_pool DECIMAL(10, 2) DEFAULT 0.00,
        winning_numbers VARCHAR(255),
        status ENUM('Pending', 'Completed') DEFAULT 'Pending',
        published BOOLEAN DEFAULT FALSE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS winners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        draw_id INT NOT NULL,
        user_id INT NOT NULL,
        match_type ENUM('3-Number', '4-Number', '5-Number'),
        prize_amount DECIMAL(10, 2),
        status ENUM('Pending', 'Verified', 'Paid', 'Rejected') DEFAULT 'Pending',
        proof_url VARCHAR(255),
        FOREIGN KEY (draw_id) REFERENCES draws(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan ENUM('Monthly', 'Yearly') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('active', 'cancelled', 'lapsed') DEFAULT 'active',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_subscription_id VARCHAR(255),
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subscription_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        status ENUM('created', 'paid', 'failed') DEFAULT 'created',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        user_id INT PRIMARY KEY,
        draw_results BOOLEAN DEFAULT TRUE,
        winner_alerts BOOLEAN DEFAULT TRUE,
        charity_updates BOOLEAN DEFAULT FALSE,
        newsletter BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    // Add missing columns to users table if not present
    try { await pool.execute(`ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE users ADD COLUMN otp_code VARCHAR(10)`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE users ADD COLUMN otp_expiry DATETIME`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE users ADD COLUMN charity_contribution_pct INT DEFAULT 10`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE charities ADD COLUMN category VARCHAR(100) DEFAULT 'Community'`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE charities ADD COLUMN location VARCHAR(255)`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE charities ADD COLUMN is_featured BOOLEAN DEFAULT FALSE`); } catch(e) {}
    try { await pool.execute(`ALTER TABLE winners MODIFY COLUMN status ENUM('Pending', 'Verified', 'Paid', 'Rejected') DEFAULT 'Pending'`); } catch(e) {}
    console.log('✅ Database tables verified');
  } catch (err) {
    console.error('Table creation error:', err.message);
  }
}
ensureTables();

// Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Razorpay instance
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const getPlatformStats = async () => {
  const [userCountRows] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users');
  const [activeRows] = await pool.execute('SELECT COUNT(*) as activeSubscribers FROM users WHERE status = "Active"');
  const [poolRows] = await pool.execute('SELECT COALESCE(SUM(prize_pool), 0) as totalPool FROM draws');
  const [charityRows] = await pool.execute('SELECT COALESCE(SUM(contributions), 0) as charityTotal FROM charities');
  const [revenueRows] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status = "paid"');
  const [nextDrawRows] = await pool.execute(
    'SELECT id, draw_date, prize_pool, winning_numbers, status, published FROM draws WHERE status = "Pending" ORDER BY draw_date ASC LIMIT 1'
  );

  return {
    totalUsers: userCountRows[0].totalUsers,
    activeSubscribers: activeRows[0].activeSubscribers,
    totalPool: parseFloat(poolRows[0].totalPool),
    charityTotal: parseFloat(charityRows[0].charityTotal),
    totalRevenue: parseFloat(revenueRows[0].totalRevenue),
    nextDraw: nextDrawRows.length > 0 ? nextDrawRows[0] : null,
  };
};

const ensureNotificationPreferences = async (userId) => {
  await pool.execute(
    'INSERT INTO notification_preferences (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id',
    [userId]
  );
  const [rows] = await pool.execute(
    'SELECT draw_results, winner_alerts, charity_updates, newsletter FROM notification_preferences WHERE user_id = ?',
    [userId]
  );
  return rows[0];
};

// ===================== AUTH ROUTES =====================

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, first_name, last_name, charity_id, charity_contribution_pct } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [existing] = await pool.execute('SELECT id, status FROM users WHERE email = ?', [email]);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    if (existing.length > 0) {
      const existingUser = existing[0];
      if (existingUser.status === 'Active') {
        return res.status(409).json({ error: 'Email already registered. Please login.' });
      }
      await pool.execute(
        'UPDATE users SET otp_code = ?, otp_expiry = ? WHERE id = ?',
        [otp, expiry, existingUser.id]
      );
    } else {
      await pool.execute(
        'INSERT INTO users (name, email, password, charity_id, charity_contribution_pct, otp_code, otp_expiry, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [`${first_name} ${last_name}`, email, password, charity_id || null, charity_contribution_pct || 10, otp, expiry, 'Pending']
      );
    }

    // Do not await the mail sending so the HTTP request doesn't hang if SMTP times out
    transporter.sendMail({
      from: `"Score for Good" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Score for Good',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#7c5c2e">Welcome to Score for Good!</h2>
          <p>Hi ${first_name},</p>
          <p>Your verification code is:</p>
          <div style="background:#f5f0e8;padding:20px;text-align:center;border-radius:8px;margin:20px 0">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#7c5c2e">${otp}</span>
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#888;font-size:12px">If you did not sign up, please ignore this email.</p>
        </div>`,
    }).then(() => {
      console.log(`✅ OTP email sent to ${email}: ${otp}`);
    }).catch(mailErr => {
      console.error('❌ Email send failed:', mailErr.message);
    });

    res.status(201).json({ message: 'Verification code sent to your email. Please check your inbox.', email });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()',
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    const user = rows[0];
    await pool.execute(
      'UPDATE users SET status = "Active", otp_code = NULL, otp_expiry = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.execute('SELECT id, name, status FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (rows[0].status === 'Active') return res.status(400).json({ error: 'User already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    
    await pool.execute('UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?', [otp, expiry, email]);

    transporter.sendMail({
      from: `"Score for Good" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Score for Good',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#7c5c2e">Resent OTP Code!</h2>
          <p>Hi ${rows[0].name},</p>
          <p>Here is your new verification code:</p>
          <div style="background:#f5f0e8;padding:20px;text-align:center;border-radius:8px;margin:20px 0">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#7c5c2e">${otp}</span>
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
        </div>`,
    }).catch(mailErr => console.error('❌ Resend Email fail:', mailErr.message));

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    if (user.status === 'Pending') {
      return res.status(403).json({ error: 'Please verify your email first. Check your inbox.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.plan, u.status, u.charity_id, u.role,
             u.charity_contribution_pct, u.joined_date,
             c.name as charity_name, c.location as charity_location, c.description as charity_description
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.id = ?`, [req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  const { name, email, charity_id, charity_contribution_pct } = req.body;
  try {
    const fields = [];
    const values = [];
    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (charity_id !== undefined) { fields.push('charity_id = ?'); values.push(charity_id); }
    if (charity_contribution_pct !== undefined) { fields.push('charity_contribution_pct = ?'); values.push(charity_contribution_pct); }
    
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    
    values.push(req.userId);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/password', verifyToken, async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (rows[0].password !== current_password) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [new_password, req.userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/stats', async (_req, res) => {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== SCORES ROUTES =====================

app.get('/api/scores', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM scores WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scores', verifyToken, async (req, res) => {
  const { score, play_date } = req.body;
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM scores WHERE user_id = ? ORDER BY date ASC',
      [req.userId]
    );
    if (existing.length >= 5) {
      await pool.execute('DELETE FROM scores WHERE id = ?', [existing[0].id]);
    }
    await pool.execute(
      'INSERT INTO scores (user_id, score, date) VALUES (?, ?, ?)',
      [req.userId, score, play_date]
    );
    res.status(201).json({ message: 'Score added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/scores/:id', verifyToken, async (req, res) => {
  const { score, play_date } = req.body;
  try {
    const fields = [];
    const values = [];
    if (score !== undefined) { fields.push('score = ?'); values.push(score); }
    if (play_date) { fields.push('date = ?'); values.push(play_date); }
    values.push(req.params.id, req.userId);
    await pool.execute(`UPDATE scores SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
    res.json({ message: 'Score updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/scores/:id', verifyToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM scores WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== CHARITIES ROUTES =====================

app.get('/api/charities', async (req, res) => {
  try {
    const { search = '', category, featured, include_inactive } = req.query;
    const filters = [];
    const values = [];

    if (include_inactive === 'true') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Admin token required for inactive charities' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
      } catch {
        return res.status(403).json({ error: 'Failed to authenticate token' });
      }
    }

    if (include_inactive !== 'true') {
      filters.push('status = "Active"');
    }
    if (search) {
      filters.push('name LIKE ?');
      values.push(`%${search}%`);
    }
    if (category && category !== 'All') {
      filters.push('category = ?');
      values.push(category);
    }
    if (featured === 'true') {
      filters.push('is_featured = TRUE');
    }

    const sql = `
      SELECT id, name, members, contributions, status, description, category, location, is_featured AS featured
      FROM charities
      ${filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''}
      ORDER BY is_featured DESC, name ASC
    `;

    const [rows] = await pool.execute(sql, values);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/charities/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT *, is_featured AS featured FROM charities WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Charity not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== DRAWS ROUTES =====================

app.get('/api/draws', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM draws ORDER BY draw_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/draws/my-results', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT d.draw_date, d.status as draw_status, d.prize_pool,
             w.match_type, w.prize_amount, w.status as winner_status
      FROM draws d
      LEFT JOIN winners w ON w.draw_id = d.id AND w.user_id = ?
      WHERE d.published = TRUE
      ORDER BY d.draw_date DESC
    `, [req.userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/draws/next', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM draws WHERE status = "Pending" ORDER BY draw_date ASC LIMIT 1'
    );
    res.json(rows.length > 0 ? rows[0] : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/draws', verifyToken, verifyAdmin, async (req, res) => {
  const { draw_date, prize_pool } = req.body;
  try {
    await pool.execute(
      'INSERT INTO draws (draw_date, prize_pool) VALUES (?, ?)',
      [draw_date, prize_pool || 0]
    );
    res.status(201).json({ message: 'Draw created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/draws/:id/simulate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const drawId = req.params.id;
    const [drawRows] = await pool.execute('SELECT * FROM draws WHERE id = ?', [drawId]);
    if (drawRows.length === 0) return res.status(404).json({ error: 'Draw not found' });
    const draw = drawRows[0];

    const [eligibleRows] = await pool.execute(`
      SELECT DISTINCT u.id, u.name
      FROM users u
      JOIN scores s ON s.user_id = u.id
      WHERE u.status = "Active"
    `);
    const eligibleCount = eligibleRows.length;

    // Generate 5 winning numbers (1-45)
    const winningNumbers = [];
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!winningNumbers.includes(num)) winningNumbers.push(num);
    }
    winningNumbers.sort((a, b) => a - b);

    await pool.execute(
      'UPDATE draws SET winning_numbers = ? WHERE id = ?',
      [winningNumbers.join(','), drawId]
    );

    await pool.execute('DELETE FROM winners WHERE draw_id = ?', [drawId]);

    const shuffledEligible = [...eligibleRows].sort(() => Math.random() - 0.5);
    const generatedWinners = [];

    for (let index = 0; index < DRAW_PRIZE_TIERS.length && index < shuffledEligible.length; index += 1) {
      const tier = DRAW_PRIZE_TIERS[index];
      const winner = shuffledEligible[index];
      const prizeAmount = Number((Number(draw.prize_pool || 0) * tier.share).toFixed(2));

      await pool.execute(
        'INSERT INTO winners (draw_id, user_id, match_type, prize_amount, status) VALUES (?, ?, ?, ?, "Pending")',
        [drawId, winner.id, tier.matchType, prizeAmount]
      );

      generatedWinners.push({
        user_id: winner.id,
        user_name: winner.name,
        match_type: tier.matchType,
        prize_amount: prizeAmount,
      });
    }

    res.json({
      draw_id: drawId,
      eligible_entries: eligibleCount,
      winning_numbers: winningNumbers,
      winners_created: generatedWinners.length,
      winners: generatedWinners,
      message: 'Simulation completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/draws/:id/publish', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE draws SET published = TRUE, status = "Completed" WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Draw published successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== WINNERS ROUTES =====================

app.get('/api/winners', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT w.*, u.name as user_name, d.draw_date
      FROM winners w
      JOIN users u ON w.user_id = u.id
      JOIN draws d ON w.draw_id = d.id
      ORDER BY d.draw_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/winners/my', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT w.*, d.draw_date
      FROM winners w
      JOIN draws d ON w.draw_id = d.id
      WHERE w.user_id = ?
      ORDER BY d.draw_date DESC
    `, [req.userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/winners/:id/proof', verifyToken, async (req, res) => {
  const { proof_url } = req.body;

  if (!proof_url) {
    return res.status(400).json({ error: 'Proof URL is required' });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE winners
       SET proof_url = ?, status = CASE WHEN status = "Rejected" THEN "Pending" ELSE status END
       WHERE id = ? AND user_id = ?`,
      [proof_url, req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Winner record not found' });
    }

    res.json({ message: 'Proof submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== SUBSCRIPTION & PAYMENT ROUTES (RAZORPAY) =====================

app.get('/api/subscriptions', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    );
    res.json(rows.length > 0 ? rows[0] : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subscriptions/create-order', verifyToken, async (req, res) => {
  const { plan } = req.body;
  const amount = plan === 'Yearly' ? 499900 : 49900; // In paise (₹4,999 or ₹499)
  
  try {
   if (!razorpay) {
  return res.status(500).json({ error: 'Razorpay is not configured yet. Contact admin.' });
}
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `sub_${req.userId}_${Date.now()}`,
      notes: { user_id: String(req.userId), plan },
    });

    // Create payment record
    await pool.execute(
      'INSERT INTO payments (user_id, amount, razorpay_order_id, status) VALUES (?, ?, ?, ?)',
      [req.userId, amount / 100, order.id, 'created']
    );

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subscriptions/verify-payment', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  
  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const amount = plan === 'Yearly' ? 4999 : 499;
    const endDate = new Date();
    if (plan === 'Yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    // Update payment record
    await pool.execute(
      'UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = "paid" WHERE razorpay_order_id = ?',
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    // Create subscription
    await pool.execute(
      'INSERT INTO subscriptions (user_id, plan, amount, status, razorpay_order_id, razorpay_payment_id, end_date) VALUES (?, ?, ?, "active", ?, ?, ?)',
      [req.userId, plan, amount, razorpay_order_id, razorpay_payment_id, endDate]
    );

    // Update user plan & status
    await pool.execute(
      'UPDATE users SET plan = ?, status = "Active" WHERE id = ?',
      [plan, req.userId]
    );

    // Update charity contributions & members count
    const [userRows] = await pool.execute(
      'SELECT charity_id, charity_contribution_pct FROM users WHERE id = ?',
      [req.userId]
    );
    if (userRows.length > 0 && userRows[0].charity_id) {
      const charityPct = userRows[0].charity_contribution_pct || 10;
      const charityAmount = (amount * charityPct) / 100;
      await pool.execute(
        'UPDATE charities SET contributions = contributions + ?, members = (SELECT COUNT(DISTINCT id) FROM users WHERE charity_id = ?) WHERE id = ?',
        [charityAmount, userRows[0].charity_id, userRows[0].charity_id]
      );
    }

    res.json({ message: 'Payment verified and subscription activated!' });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subscriptions/cancel', verifyToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"',
      [req.userId]
    );
    await pool.execute('UPDATE users SET status = "Inactive" WHERE id = ?', [req.userId]);
    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== PAYMENTS HISTORY =====================

app.get('/api/payments', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE user_id = ? AND status = "paid" ORDER BY payment_date DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/preferences', verifyToken, async (req, res) => {
  try {
    const preferences = await ensureNotificationPreferences(req.userId);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/preferences', verifyToken, async (req, res) => {
  const drawResults = req.body.draw_results !== undefined ? !!req.body.draw_results : true;
  const winnerAlerts = req.body.winner_alerts !== undefined ? !!req.body.winner_alerts : true;
  const charityUpdates = req.body.charity_updates !== undefined ? !!req.body.charity_updates : false;
  const newsletter = req.body.newsletter !== undefined ? !!req.body.newsletter : true;

  try {
    await pool.execute(
      `INSERT INTO notification_preferences (user_id, draw_results, winner_alerts, charity_updates, newsletter)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         draw_results = VALUES(draw_results),
         winner_alerts = VALUES(winner_alerts),
         charity_updates = VALUES(charity_updates),
         newsletter = VALUES(newsletter)`,
      [req.userId, drawResults, winnerAlerts, charityUpdates, newsletter]
    );

    const preferences = await ensureNotificationPreferences(req.userId);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== USER DASHBOARD STATS =====================

app.get('/api/reports/dashboard', verifyToken, async (req, res) => {
  try {
    const [winnings] = await pool.execute(
      'SELECT COALESCE(SUM(prize_amount), 0) as total_won FROM winners WHERE user_id = ?',
      [req.userId]
    );
    const [drawsEntered] = await pool.execute(
      'SELECT COUNT(DISTINCT d.id) as count FROM draws d WHERE d.published = TRUE'
    );
    const [myWins] = await pool.execute(
      'SELECT COUNT(*) as count FROM winners WHERE user_id = ?',
      [req.userId]
    );
    const [contribution] = await pool.execute(`
      SELECT COALESCE(SUM(p.amount * u.charity_contribution_pct / 100), 0) as total
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.status = 'paid'
    `, [req.userId]);

    res.json({
      totalWon: parseFloat(winnings[0].total_won),
      drawsEntered: drawsEntered[0].count,
      totalWins: myWins[0].count,
      charityContributed: parseFloat(contribution[0].total),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===================== ADMIN ROUTES =====================

app.get('/api/reports/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.plan, u.status, u.role, u.joined_date,
             u.charity_contribution_pct, c.name as charity_name
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      ORDER BY u.joined_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/scores', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, u.name as user_name, u.email as user_email
      FROM scores s JOIN users u ON s.user_id = u.id
      ORDER BY s.date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Edit any score
app.put('/api/admin/scores/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { score, play_date } = req.body;
  try {
    const fields = [];
    const values = [];
    if (score !== undefined) { fields.push('score = ?'); values.push(score); }
    if (play_date) { fields.push('date = ?'); values.push(play_date); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    await pool.execute(`UPDATE scores SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Score updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete any score
app.delete('/api/admin/scores/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM scores WHERE id = ?', [req.params.id]);
    res.json({ message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Edit user
app.put('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, plan, status, role, charity_id, charity_contribution_pct } = req.body;
  try {
    const fields = [];
    const values = [];
    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (plan) { fields.push('plan = ?'); values.push(plan); }
    if (status) { fields.push('status = ?'); values.push(status); }
    if (role) { fields.push('role = ?'); values.push(role); }
    if (charity_id !== undefined) { fields.push('charity_id = ?'); values.push(charity_id); }
    if (charity_contribution_pct !== undefined) { fields.push('charity_contribution_pct = ?'); values.push(charity_contribution_pct); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add charity
app.post('/api/admin/charities', verifyToken, verifyAdmin, async (req, res) => {
  const { name, description, category, location, featured } = req.body;
  try {
    await pool.execute(
      'INSERT INTO charities (name, description, category, location, status, is_featured) VALUES (?, ?, ?, ?, "Active", ?)',
      [name, description || '', category || 'Community', location || '', featured ? 1 : 0]
    );
    res.status(201).json({ message: 'Charity added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Edit charity
app.put('/api/admin/charities/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { name, description, category, location, status, featured } = req.body;
  try {
    const fields = [];
    const values = [];
    if (name) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (category) { fields.push('category = ?'); values.push(category); }
    if (location !== undefined) { fields.push('location = ?'); values.push(location); }
    if (status) { fields.push('status = ?'); values.push(status); }
    if (featured !== undefined) { fields.push('is_featured = ?'); values.push(featured ? 1 : 0); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    await pool.execute(`UPDATE charities SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Charity updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete charity
app.delete('/api/admin/charities/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM charities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Charity deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update winner status (Verify / Reject / Mark Paid)
app.put('/api/admin/winners/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    if (!['Pending', 'Verified', 'Paid', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.execute('UPDATE winners SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Winner status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Draw statistics
app.get('/api/admin/draw-stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [totalDraws] = await pool.execute('SELECT COUNT(*) as count FROM draws');
    const [completedDraws] = await pool.execute('SELECT COUNT(*) as count FROM draws WHERE status = "Completed"');
    const [pendingDraws] = await pool.execute('SELECT COUNT(*) as count FROM draws WHERE status = "Pending"');
    const [totalWinners] = await pool.execute('SELECT COUNT(*) as count FROM winners');
    const [jackpotRollovers] = await pool.execute('SELECT COUNT(*) as count FROM draws WHERE status = "Completed" AND id NOT IN (SELECT DISTINCT draw_id FROM winners WHERE match_type = "5-Number")');
    
    res.json({
      totalDraws: totalDraws[0].count,
      completedDraws: completedDraws[0].count,
      pendingDraws: pendingDraws[0].count,
      totalWinners: totalWinners[0].count,
      jackpotRollovers: jackpotRollovers[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Score for Good API is running!');
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
