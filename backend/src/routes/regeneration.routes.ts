import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { query } from '../database/connection';
import { generateLessonContent } from '../services/ai.service';

const router = Router();

// Get regeneration info for a course
router.get('/course/:courseId/info', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT regenerations_remaining, last_regeneration_at
       FROM courses
       WHERE id = $1 AND user_id = $2`,
      [courseId, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get regeneration info error:', error);
    res.status(500).json({ error: 'Failed to get regeneration info' });
  }
});

// Regenerate entire course
router.post('/course/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;

    // Check if course exists and belongs to user
    const courseResult = await query(
      'SELECT * FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, req.user!.id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Check if regenerations are available
    if (course.regenerations_remaining <= 0) {
      return res.status(400).json({ 
        error: 'No regenerations remaining',
        regenerations_remaining: 0
      });
    }

    // Update course status to generating
    await query(
      'UPDATE courses SET status = $1 WHERE id = $2',
      ['generating', courseId]
    );

    // Decrease regenerations count
    await query(
      `UPDATE courses 
       SET regenerations_remaining = regenerations_remaining - 1,
           last_regeneration_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [courseId]
    );

    // Log regeneration
    await query(
      `INSERT INTO regeneration_history (user_id, course_id, regeneration_type, reason)
       VALUES ($1, $2, $3, $4)`,
      [req.user!.id, courseId, 'course', reason || 'User requested regeneration']
    );

    // TODO: Trigger background job to regenerate all lessons
    // For now, we'll return success and the generation will happen async

    res.json({ 
      message: 'Course regeneration started',
      regenerations_remaining: course.regenerations_remaining - 1
    });
  } catch (error) {
    console.error('Regenerate course error:', error);
    res.status(500).json({ error: 'Failed to regenerate course' });
  }
});

// Regenerate specific theme
router.post('/theme/:themeId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { themeId } = req.params;
    const { reason } = req.body;

    // Get theme and check course ownership
    const themeResult = await query(
      `SELECT t.*, c.user_id, c.regenerations_remaining
       FROM themes t
       JOIN courses c ON c.id = t.course_id
       WHERE t.id = $1`,
      [themeId]
    );

    if (themeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const theme = themeResult.rows[0];

    if (theme.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (theme.regenerations_remaining <= 0) {
      return res.status(400).json({ 
        error: 'No regenerations remaining for this course',
        regenerations_remaining: 0
      });
    }

    // Update theme regeneration count
    await query(
      `UPDATE themes
       SET regenerations_count = regenerations_count + 1,
           last_regeneration_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [themeId]
    );

    // Decrease course regenerations
    await query(
      `UPDATE courses
       SET regenerations_remaining = regenerations_remaining - 1,
           last_regeneration_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [theme.course_id]
    );

    // Log regeneration
    await query(
      `INSERT INTO regeneration_history (user_id, course_id, theme_id, regeneration_type, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.id, theme.course_id, themeId, 'theme', reason || 'User requested theme regeneration']
    );

    res.json({ 
      message: 'Theme regeneration started',
      regenerations_remaining: theme.regenerations_remaining - 1
    });
  } catch (error) {
    console.error('Regenerate theme error:', error);
    res.status(500).json({ error: 'Failed to regenerate theme' });
  }
});

// Regenerate specific lesson
router.post('/lesson/:lessonId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { reason } = req.body;

    // Get lesson and check course ownership
    const lessonResult = await query(
      `SELECT l.*, t.course_id, c.user_id, c.regenerations_remaining
       FROM lessons l
       JOIN themes t ON t.id = l.theme_id
       JOIN courses c ON c.id = t.course_id
       WHERE l.id = $1`,
      [lessonId]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = lessonResult.rows[0];

    if (lesson.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (lesson.regenerations_remaining <= 0) {
      return res.status(400).json({ 
        error: 'No regenerations remaining for this course',
        regenerations_remaining: 0
      });
    }

    // Update lesson content to "generating" state
    await query(
      `UPDATE lessons
       SET content = 'Контент генерируется...',
           regenerations_count = regenerations_count + 1,
           last_regeneration_at = CURRENT_TIMESTAMP,
           is_generated = FALSE
       WHERE id = $1`,
      [lessonId]
    );

    // Decrease course regenerations
    await query(
      `UPDATE courses
       SET regenerations_remaining = regenerations_remaining - 1,
           last_regeneration_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [lesson.course_id]
    );

    // Log regeneration
    await query(
      `INSERT INTO regeneration_history (user_id, course_id, lesson_id, regeneration_type, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.id, lesson.course_id, lessonId, 'lesson', reason || 'User requested lesson regeneration']
    );

    // Regenerate content using AI service
    try {
      const newContent = await generateLessonContent({
        courseTitle: lesson.title,
        themeTitle: '', // Could fetch from theme if needed
        lessonTitle: lesson.title,
        lessonType: lesson.lesson_type
      });

      await query(
        `UPDATE lessons
         SET content = $1, is_generated = TRUE
         WHERE id = $2`,
        [newContent, lessonId]
      );

      res.json({ 
        message: 'Lesson regenerated successfully',
        regenerations_remaining: lesson.regenerations_remaining - 1,
        content: newContent
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      await query(
        `UPDATE lessons
         SET content = 'Ошибка при генерации контента'
         WHERE id = $1`,
        [lessonId]
      );
      throw aiError;
    }
  } catch (error) {
    console.error('Regenerate lesson error:', error);
    res.status(500).json({ error: 'Failed to regenerate lesson' });
  }
});

export default router;
