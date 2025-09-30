export const COURSE_TYPES = {
  tilda: {
    id: 'tilda',
    name: 'Базовая Tilda',
    description: 'Курс для начинающих. Базовое представление о работе с Tilda и запуск первого сайта.',
    price: 799,
    icon: '🎨',
  },
  prompt_engineering: {
    id: 'prompt_engineering',
    name: 'Промптер',
    description: 'Начальный курс по правильному написанию запросов к нейросети. От "Сделай хорошо" до четко описанного ТЗ.',
    price: 799,
    icon: '✍️',
  },
  neural_networks_basic: {
    id: 'neural_networks_basic',
    name: 'Нейросети. База',
    description: 'Курс для начинающих. Базовое представление о том что такое нейросети и как они работают.',
    price: 1199,
    icon: '🤖',
    isDemo: true, // This will be the demo course
  },
  neural_networks_advanced: {
    id: 'neural_networks_advanced',
    name: 'Нейросети. Расширенный',
    description: 'Курс для продвинутых. Глубокое понимание работы нейросетей и расширенные возможности работы с ними.',
    price: 1799,
    icon: '🧠',
  },
  web_development: {
    id: 'web_development',
    name: 'Веб-разработка. Начало',
    description: 'Курс для начинающих. Простое и понятное представление о том, как работают все сайты в мире.',
    price: 1199,
    icon: '💻',
  },
  telegram_bots: {
    id: 'telegram_bots',
    name: 'Telegram-боты. Начало',
    description: 'Курс для начинающих. Запросы, ответы, кнопки, сообщения - всё для вашего бота.',
    price: 1199,
    icon: '🤖',
  },
} as const;

export type CourseTypeId = keyof typeof COURSE_TYPES;

export const COURSE_LEVELS = {
  beginner: { id: 'beginner', name: 'Новичок', description: 'Начинаю с нуля' },
  basic: { id: 'basic', name: 'Базовый', description: 'Есть минимальные знания' },
  advanced: { id: 'advanced', name: 'Продвинутый', description: 'Хочу углубить знания' },
} as const;

export const COURSE_GOALS = {
  work: { id: 'work', name: 'Для работы', icon: '💼' },
  personal: { id: 'personal', name: 'Для себя', icon: '🎯' },
  business: { id: 'business', name: 'Для бизнеса', icon: '🚀' },
  other: { id: 'other', name: 'Другое', icon: '✨' },
} as const;

export const COURSE_FORMATS = {
  theory: { id: 'theory', name: 'Больше теории', description: 'Хочу понять концепции' },
  practice: { id: 'practice', name: 'Больше практики', description: 'Хочу делать руками' },
  balanced: { id: 'balanced', name: 'Сбалансированно', description: 'Теория + практика поровну' },
} as const;

export const POINTS_REWARDS = {
  lesson_completed: 1,
  quiz_completed: 2,
  test_completed: 3,
  final_project_completed: 4,
  course_completed: 5,
} as const;

export const DISCOUNT_RATES = {
  100: 10, // 100 points = 10% discount
  200: 20, // 200 points = 20% discount
  500: 50, // 500 points = 50% discount
} as const;
