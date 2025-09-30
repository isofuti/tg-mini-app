import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { query } from '../database/connection';

const router = Router();

// Get user's courses
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM user_progress up 
         JOIN lessons l ON l.id = up.lesson_id 
         JOIN themes t ON t.id = l.theme_id 
         WHERE t.course_id = c.id AND up.user_id = $1 AND up.is_completed = true) as completed_lessons,
        (SELECT COUNT(*) FROM lessons l 
         JOIN themes t ON t.id = l.theme_id 
         WHERE t.course_id = c.id) as total_lessons
       FROM courses c
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user!.id]
    );

    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get specific course
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const courseResult = await query(
      'SELECT * FROM courses WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Get themes with lessons
    const themesResult = await query(
      `SELECT t.*, 
        json_agg(
          json_build_object(
            'id', l.id,
            'lessonNumber', l.lesson_number,
            'title', l.title,
            'lessonType', l.lesson_type,
            'isGenerated', l.is_generated
          ) ORDER BY l.lesson_number
        ) as lessons
       FROM themes t
       LEFT JOIN lessons l ON l.theme_id = t.id
       WHERE t.course_id = $1
       GROUP BY t.id
       ORDER BY t.theme_number`,
      [id]
    );

    res.json({
      ...course,
      themes: themesResult.rows,
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// Create new course (with survey responses)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseType, surveyResponses } = req.body;

    if (!courseType || !surveyResponses) {
      return res.status(400).json({ error: 'courseType and surveyResponses are required' });
    }

    // Create course with status 'generating'
    const courseResult = await query(
      `INSERT INTO courses (user_id, course_type, title, status)
       VALUES ($1, $2, $3, 'generating')
       RETURNING *`,
      [req.user!.id, courseType, `Курс по ${courseType}`]
    );

    const course = courseResult.rows[0];

    // Save survey responses
    for (const response of surveyResponses) {
      await query(
        'INSERT INTO survey_responses (course_id, question, answer) VALUES ($1, $2, $3)',
        [course.id, response.question, response.answer]
      );
    }

    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

export default router;
