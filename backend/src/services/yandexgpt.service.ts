import axios from 'axios';
import { getCache, setCache } from '../cache/redis';

interface CourseStructure {
  title: string;
  description: string;
  themes: {
    themeNumber: number;
    title: string;
    description: string;
    lessonsCount: number;
  }[];
}

interface LessonContent {
  title: string;
  content: string;
  type: 'theory' | 'practice' | 'quiz';
}

export class LLMService {
  private apiUrl: string;
  private model: string;
  private apiType: string;

  constructor() {
    this.apiUrl = process.env.LLM_API_URL || 'http://192.168.3.199:1234';
    this.model = process.env.LLM_MODEL || 'openai/gpt-oss-20b';
    this.apiType = process.env.LLM_API_TYPE || 'openai';
  }

  private async makeRequest(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      // OpenAI-compatible API (LMStudio)
      const response = await axios.post(
        `${this.apiUrl}/v1/chat/completions`,
        {
          model: this.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds for local LLM
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('LLM API error:', error.response?.data || error.message);
      throw new Error('Failed to generate content with LLM');
    }
  }

  async generateCourseStructure(surveyData: {
    courseType: string;
    level: string;
    goal: string;
    timePerWeek: string;
    format: string;
    additionalNotes?: string;
  }): Promise<CourseStructure> {
    // Check cache first
    const cacheKey = `course_structure:${JSON.stringify(surveyData)}`;
    const cached = await getCache<CourseStructure>(cacheKey);
    if (cached) {
      return cached;
    }

    const systemPrompt = `Ты - опытный методолог и преподаватель. Твоя задача - создавать структуры образовательных курсов.`;

    const prompt = `
Создай структуру образовательного курса по направлению: ${surveyData.courseType}

Параметры курса:
- Уровень пользователя: ${surveyData.level}
- Цель обучения: ${surveyData.goal}
- Доступное время: ${surveyData.timePerWeek} часов в неделю
- Формат: ${surveyData.format}
${surveyData.additionalNotes ? `- Дополнительные пожелания: ${surveyData.additionalNotes}` : ''}

Требования:
- Курс должен содержать ровно 5 тем
- Каждая тема должна содержать от 10 до 15 уроков
- Материал должен прогрессивно усложняться
- Учитывай уровень пользователя и его цели

Верни результат СТРОГО в формате JSON:
{
  "title": "Название курса",
  "description": "Краткое описание курса",
  "themes": [
    {
      "themeNumber": 1,
      "title": "Название темы",
      "description": "Описание темы",
      "lessonsCount": 12
    }
  ]
}

Только JSON, без дополнительного текста!
`;

    try {
      const response = await this.makeRequest(prompt, systemPrompt);
      
      // Extract JSON from response (sometimes GPT adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from YandexGPT');
      }

      const structure: CourseStructure = JSON.parse(jsonMatch[0]);
      
      // Cache for 24 hours
      await setCache(cacheKey, structure, 86400);
      
      return structure;
    } catch (error) {
      console.error('Failed to generate course structure:', error);
      throw error;
    }
  }

  async generateLessonContent(context: {
    courseTitle: string;
    courseType: string;
    themeTitle: string;
    lessonNumber: number;
    lessonTitle: string;
    previousLessons?: string[];
    userLevel: string;
  }): Promise<LessonContent> {
    const cacheKey = `lesson:${context.courseTitle}:${context.themeTitle}:${context.lessonNumber}`;
    const cached = await getCache<LessonContent>(cacheKey);
    if (cached) {
      return cached;
    }

    const systemPrompt = `Ты - опытный преподаватель по направлению "${context.courseType}". Создавай качественный образовательный контент.`;

    const previousContext = context.previousLessons?.length
      ? `\nПредыдущие уроки в теме:\n${context.previousLessons.join('\n')}`
      : '';

    const prompt = `
Создай подробный образовательный материал для урока.

Контекст курса:
- Название курса: ${context.courseTitle}
- Направление: ${context.courseType}
- Название темы: ${context.themeTitle}
- Урок номер: ${context.lessonNumber}
- Название урока: ${context.lessonTitle}
- Уровень учащегося: ${context.userLevel}
${previousContext}

Требования:
- Урок должен быть подробным (минимум 300-500 слов)
- Используй четкую структуру с подзаголовками
- Добавь примеры и практические советы
- Материал должен быть понятен для уровня "${context.userLevel}"
- Учитывай контекст предыдущих уроков (если есть)

Верни результат в формате JSON:
{
  "title": "Название урока",
  "content": "Полный текст урока с markdown форматированием",
  "type": "theory"
}

Только JSON, без дополнительного текста!
`;

    try {
      const response = await this.makeRequest(prompt, systemPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from YandexGPT');
      }

      const lesson: LessonContent = JSON.parse(jsonMatch[0]);
      
      // Cache for 7 days
      await setCache(cacheKey, lesson, 604800);
      
      return lesson;
    } catch (error) {
      console.error('Failed to generate lesson content:', error);
      throw error;
    }
  }

  async generateQuiz(context: {
    lessonTitle: string;
    lessonContent: string;
    questionsCount: number;
  }): Promise<any[]> {
    const prompt = `
На основе урока создай викторину.

Урок: ${context.lessonTitle}

Краткое содержание урока:
${context.lessonContent.substring(0, 500)}...

Создай ${context.questionsCount} вопросов с вариантами ответов.

Требования:
- Каждый вопрос должен иметь 4 варианта ответа
- Только один правильный ответ
- Вопросы должны проверять понимание материала

Верни результат в формате JSON:
[
  {
    "question": "Текст вопроса",
    "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
    "correctAnswer": 0
  }
]

Только JSON массив!
`;

    try {
      const response = await this.makeRequest(prompt);
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from YandexGPT');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw error;
    }
  }
}

export default new LLMService();
