import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT,
});

// Simple session storage
const sessions = {};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, password, address, 'user']
    );
    
    const sessionId = Math.random().toString(36).substring(7);
    sessions[sessionId] = newUser.rows[0];
    
    res.json({
      message: 'Registration successful',
      sessionId,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const sessionId = Math.random().toString(36).substring(7);
    sessions[sessionId] = user.rows[0];
    
    res.json({
      message: 'Login successful',
      sessionId,
      user: user.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  const sessionId = req.headers.authorization;
  const user = sessions[sessionId];
  
  if (!user) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  
  req.user = user;
  next();
};

// Password routes
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Email not found' });
    }
    
    res.json({ 
      message: 'Email verified. You can now set new password.',
      userId: user.rows[0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [newPassword, userId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/update-password', checkAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND password = $2',
      [req.user.id, currentPassword]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update to new password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [newPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.put('/api/user/password', checkAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND password = $2',
      [req.user.id, currentPassword]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [newPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Store routes
app.get('/api/stores', checkAuth, async (req, res) => {
  try {
    const stores = await pool.query(`
      SELECT s.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        (
          SELECT rating FROM ratings 
          WHERE user_id = $1 AND store_id = s.id
        ) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.name
    `, [req.user.id]);
    
    res.json(stores.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/ratings', checkAuth, async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    
    await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating) 
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET rating = $3
    `, [req.user.id, storeId, rating]);
    
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/dashboard', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');
    
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const users = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE role IN ('admin', 'user') ORDER BY name"
    );
    
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/stores', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const stores = await pool.query(`
      SELECT s.*, COALESCE(AVG(r.rating), 0) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    
    res.json(stores.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Store Owner routes
app.get('/api/owner/ratings', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const ratings = await pool.query(`
      SELECT u.name as user_name, u.email, s.name as store_name, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    
    const averageRating = await pool.query(`
      SELECT COALESCE(AVG(r.rating), 0) as average_rating
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
    `, [req.user.id]);
    
    res.json({
      ratings: ratings.rows,
      average_rating: parseFloat(averageRating.rows[0].average_rating).toFixed(1)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', checkAuth, (req, res) => {
  const sessionId = req.headers.authorization;
  delete sessions[sessionId];
  res.json({ message: 'Logged out successfully' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});