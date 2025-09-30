import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { query } from '../database/connection';

const router = Router();

// Middleware to check admin access (placeholder)
async function requireAdmin(req: AuthRequest, res: Response, next: any) {
  try {
    const result = await query(
      'SELECT * FROM admin_users WHERE user_id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
}

// Get dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const coursesResult = await query('SELECT COUNT(*) as count FROM courses');
    const paymentsResult = await query(
      "SELECT SUM(final_amount) as total FROM payments WHERE status = 'completed'"
    );

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalCourses: parseInt(coursesResult.rows[0].count),
      totalRevenue: parseInt(paymentsResult.rows[0].total || 0),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT u.*, 
        COUNT(DISTINCT c.id) as courses_count,
        u.points_balance
       FROM users u
       LEFT JOIN courses c ON c.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
