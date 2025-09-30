import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { query } from '../database/connection';

const router = Router();

// Get lesson by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT l.*, t.course_id
       FROM lessons l
       JOIN themes t ON t.id = l.theme_id
       JOIN courses c ON c.id = t.course_id
       WHERE l.id = $1 AND c.user_id = $2`,
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
});

// Mark lesson as completed
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get lesson and course info
    const lessonResult = await query(
      `SELECT l.*, t.course_id
       FROM lessons l
       JOIN themes t ON t.id = l.theme_id
       JOIN courses c ON c.id = t.course_id
       WHERE l.id = $1 AND c.user_id = $2`,
      [id, req.user!.id]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = lessonResult.rows[0];

    // Check if already completed
    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
      [req.user!.id, id]
    );

    if (progressResult.rows.length > 0 && progressResult.rows[0].is_completed) {
      return res.json({ message: 'Lesson already completed', points: 0 });
    }

    // Mark as completed
    await query(
      `INSERT INTO user_progress (user_id, course_id, lesson_id, is_completed, completed_at)
       VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET is_completed = true, completed_at = CURRENT_TIMESTAMP`,
      [req.user!.id, lesson.course_id, id]
    );

    // Award points (1 point per lesson)
    const points = 1;
    await query(
      `UPDATE users SET points_balance = points_balance + $1 WHERE id = $2`,
      [points, req.user!.id]
    );

    await query(
      `INSERT INTO points_history (user_id, action, points, description, reference_id)
       VALUES ($1, 'lesson_completed', $2, $3, $4)`,
      [req.user!.id, points, `Completed lesson: ${lesson.title}`, id]
    );

    res.json({ message: 'Lesson marked as completed', points });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

export default router;
