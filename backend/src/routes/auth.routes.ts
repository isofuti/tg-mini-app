import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';
import { validateTelegramWebAppData } from '../utils/telegram';

const router = Router();

// Telegram WebApp authentication
router.post('/telegram', async (req: Request, res: Response) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    // Validate Telegram WebApp data
    const userData = validateTelegramWebAppData(initData);

    if (!userData) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [userData.id]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await query(
        `INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, last_login_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          userData.id,
          userData.username || null,
          userData.first_name || null,
          userData.last_name || null,
          userData.photo_url || null,
        ]
      );
      user = insertResult.rows[0];
    } else {
      // Update existing user
      const updateResult = await query(
        `UPDATE users 
         SET username = $1, first_name = $2, last_name = $3, photo_url = $4, last_login_at = CURRENT_TIMESTAMP
         WHERE telegram_id = $5
         RETURNING *`,
        [
          userData.username || null,
          userData.first_name || null,
          userData.last_name || null,
          userData.photo_url || null,
          userData.id,
        ]
      );
      user = updateResult.rows[0];
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
      },
      secret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
        pointsBalance: user.points_balance,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify token
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as any;

    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
        pointsBalance: user.points_balance,
      },
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;
