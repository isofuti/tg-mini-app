import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { query } from '../database/connection';

const router = Router();

// Get points history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM points_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [req.user!.id]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ error: 'Failed to get points history' });
  }
});

// Get current points balance
router.get('/balance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT points_balance FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: result.rows[0].points_balance });
  } catch (error) {
    console.error('Get points balance error:', error);
    res.status(500).json({ error: 'Failed to get points balance' });
  }
});

export default router;
