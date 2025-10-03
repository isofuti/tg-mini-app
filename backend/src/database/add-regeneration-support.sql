-- Add regeneration support to courses and lessons
-- Users can regenerate content up to 5 times after purchase

-- Add regeneration columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS regenerations_remaining INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS last_regeneration_at TIMESTAMP;

-- Add regeneration tracking columns to lessons table  
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS regenerations_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_regeneration_at TIMESTAMP;

-- Add regeneration tracking columns to themes table
ALTER TABLE themes
ADD COLUMN IF NOT EXISTS regenerations_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_regeneration_at TIMESTAMP;

-- Create regeneration history table
CREATE TABLE IF NOT EXISTS regeneration_history (\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  regeneration_type VARCHAR(50) NOT NULL, -- 'course', 'theme', 'lesson'
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_regeneration_history_user_id ON regeneration_history(user_id);
CREATE INDEX IF NOT EXISTS idx_regeneration_history_course_id ON regeneration_history(course_id);

-- Set default regenerations for existing courses
UPDATE courses
SET regenerations_remaining = 5
WHERE regenerations_remaining IS NULL;

-- Comment
COMMENT ON COLUMN courses.regenerations_remaining IS 'Number of times user can regenerate this course (default: 5)';
COMMENT ON COLUMN lessons.regenerations_count IS 'How many times this lesson has been regenerated';
COMMENT ON TABLE regeneration_history IS 'Tracks all regeneration requests for analytics';
