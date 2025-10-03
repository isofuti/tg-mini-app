// AI Service wrapper for easier usage
import llmService from './yandexgpt.service';

interface GenerateLessonParams {
  courseTitle: string;
  themeTitle: string;
  lessonTitle: string;
  lessonType: 'theory' | 'practice' | 'quiz' | 'test';
  courseType?: string;
  userLevel?: string;
}

export async function generateLessonContent(params: GenerateLessonParams): Promise<string> {
  try {
    const lessonContent = await llmService.generateLessonContent({
      courseTitle: params.courseTitle,
      courseType: params.courseType || 'general',
      themeTitle: params.themeTitle,
      lessonNumber: 1, // Can be improved
      lessonTitle: params.lessonTitle,
      userLevel: params.userLevel || 'beginner',
    });

    return lessonContent.content;
  } catch (error) {
    console.error('Error generating lesson content:', error);
    throw new Error('Failed to generate lesson content');
  }
}

export async function generateCourseStructure(surveyData: any) {
  return llmService.generateCourseStructure(surveyData);
}

export async function generateQuiz(lessonContent: string, questionsCount: number = 5) {
  return llmService.generateQuiz({
    lessonTitle: 'Quiz',
    lessonContent,
    questionsCount,
  });
}
