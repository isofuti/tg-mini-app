import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { COURSE_TYPES, COURSE_LEVELS, COURSE_GOALS, COURSE_FORMATS } from '../constants/courses';

const router = Router();

// Get demo courses catalog (PUBLIC - no auth required)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get actual demo courses from database
    const coursesResult = await query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.course_type,
        c.price,
        c.status,
        c.created_at,
        (SELECT COUNT(*) FROM themes WHERE course_id = c.id) as themes_count,
        (SELECT COUNT(*) FROM lessons l 
         JOIN themes t ON l.theme_id = t.id 
         WHERE t.course_id = c.id) as lessons_count
       FROM courses c
       WHERE c.is_demo = TRUE AND c.status = 'active'
       ORDER BY c.created_at DESC`
    );

    res.json({
      courses: coursesResult.rows,
      courseTypes: Object.values(COURSE_TYPES),
      levels: Object.values(COURSE_LEVELS),
      goals: Object.values(COURSE_GOALS),
      formats: Object.values(COURSE_FORMATS),
    });
  } catch (error) {
    console.error('Get catalog error:', error);
    res.status(500).json({ error: 'Failed to get catalog' });
  }
});

// Get specific demo course details (PUBLIC - no auth required)
router.get('/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Get course
    const courseResult = await query(
      'SELECT * FROM courses WHERE id = $1 AND is_demo = TRUE AND status = $2',
      [courseId, 'active']
    );
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get themes
    const themesResult = await query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM lessons WHERE theme_id = t.id) as lessons_count
       FROM themes t
       WHERE t.course_id = $1
       ORDER BY t.theme_number`,
      [courseId]
    );
    
    // Get lessons for each theme
    const lessonsResult = await query(
      `SELECT l.*, t.theme_number
       FROM lessons l
       JOIN themes t ON l.theme_id = t.id
       WHERE t.course_id = $1
       ORDER BY t.theme_number, l.lesson_number`,
      [courseId]
    );

    res.json({
      course: courseResult.rows[0],
      themes: themesResult.rows,
      lessons: lessonsResult.rows
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ error: 'Failed to get course details' });
  }
});

export default router;
