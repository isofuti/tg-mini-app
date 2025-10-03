-- Update demo course price to 0 (free)
-- This makes the demo course "Основы Python для начинающих" free for all users

UPDATE courses
SET price = 0
WHERE is_demo = TRUE
  AND id = '00000000-0000-0000-0000-000000000001';

-- Verify update
SELECT id, title, price, is_demo 
FROM courses 
WHERE is_demo = TRUE;
