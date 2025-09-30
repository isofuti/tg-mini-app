import { Router, Request, Response } from 'express';
import { COURSE_TYPES, COURSE_LEVELS, COURSE_GOALS, COURSE_FORMATS } from '../constants/courses';

const router = Router();

// Get course catalog
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      courses: Object.values(COURSE_TYPES),
      levels: Object.values(COURSE_LEVELS),
      goals: Object.values(COURSE_GOALS),
      formats: Object.values(COURSE_FORMATS),
    });
  } catch (error) {
    console.error('Get catalog error:', error);
    res.status(500).json({ error: 'Failed to get catalog' });
  }
});

// Get specific course type info
router.get('/:courseType', async (req: Request, res: Response) => {
  try {
    const { courseType } = req.params;
    const course = COURSE_TYPES[courseType as keyof typeof COURSE_TYPES];

    if (!course) {
      return res.status(404).json({ error: 'Course type not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course type error:', error);
    res.status(500).json({ error: 'Failed to get course type' });
  }
});

export default router;
