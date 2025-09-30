import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useCourseStore } from '@/store/courseStore';

const COURSE_OPTIONS = [
  { id: 'tilda', name: 'Базовая Tilda', icon: '🎨' },
  { id: 'prompt_engineering', name: 'Промптер', icon: '✍️' },
  { id: 'neural_networks_basic', name: 'Нейросети. База', icon: '🤖' },
  { id: 'neural_networks_advanced', name: 'Нейросети. Расширенный', icon: '🧠' },
  { id: 'web_development', name: 'Веб-разработка. Начало', icon: '💻' },
  { id: 'telegram_bots', name: 'Telegram-боты. Начало', icon: '🤖' },
];

const LEVELS = [
  { id: 'beginner', name: 'Новичок', desc: 'Начинаю с нуля' },
  { id: 'basic', name: 'Базовый', desc: 'Есть минимальные знания' },
  { id: 'advanced', name: 'Продвинутый', desc: 'Хочу углубить знания' },
];

const GOALS = [
  { id: 'work', name: 'Для работы', icon: '💼' },
  { id: 'personal', name: 'Для себя', icon: '🎯' },
  { id: 'business', name: 'Для бизнеса', icon: '🚀' },
  { id: 'other', name: 'Другое', icon: '✨' },
];

const FORMATS = [
  { id: 'theory', name: 'Больше теории', desc: 'Хочу понять концепции' },
  { id: 'practice', name: 'Больше практики', desc: 'Хочу делать руками' },
  { id: 'balanced', name: 'Сбалансированно', desc: 'Теория + практика поровну' },
];

export default function SurveyPage() {
  const navigate = useNavigate();
  const { createCourse } = useCourseStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    courseType: '',
    level: '',
    goal: '',
    timePerWeek: '',
    format: '',
    additionalNotes: '',
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const surveyResponses = [
        { question: 'Направление', answer: formData.courseType },
        { question: 'Уровень знаний', answer: formData.level },
        { question: 'Цель обучения', answer: formData.goal },
        { question: 'Время в неделю', answer: formData.timePerWeek },
        { question: 'Формат', answer: formData.format },
        ...(formData.additionalNotes
          ? [{ question: 'Дополнительные пожелания', answer: formData.additionalNotes }]
          : []),
      ];

      const course = await createCourse({ courseType: formData.courseType, surveyResponses });
      navigate(`/course/${course.id}`);
    } catch (error) {
      alert('Ошибка при создании курса. Попробуйте снова.');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.courseType !== '';
      case 2:
        return formData.level !== '';
      case 3:
        return formData.goal !== '';
      case 4:
        return formData.timePerWeek !== '';
      case 5:
        return formData.format !== '';
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <Layout showNav={false} title="Создание курса">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Шаг {step} из {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card variant="elevated" padding="lg">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Выберите направление</h2>
              <p className="text-gray-600 mb-4">Что хотите изучить?</p>
              <div className="space-y-2">
                {COURSE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, courseType: option.id })}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      formData.courseType === option.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <span className="font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Ваш уровень</h2>
              <p className="text-gray-600 mb-4">Какой у вас опыт в этой области?</p>
              <div className="space-y-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, level: level.id })}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      formData.level === level.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{level.name}</div>
                    <div className="text-sm text-gray-600">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Цель обучения</h2>
              <p className="text-gray-600 mb-4">Зачем вам этот курс?</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setFormData({ ...formData, goal: goal.id })}
                    className={`p-4 text-center rounded-lg border-2 transition-all ${
                      formData.goal === goal.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{goal.icon}</div>
                    <div className="text-sm font-medium">{goal.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Доступное время</h2>
              <p className="text-gray-600 mb-4">Сколько часов в неделю готовы уделять?</p>
              <div className="space-y-2">
                {['1-2 часа', '3-5 часов', '5-10 часов', 'Более 10 часов'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setFormData({ ...formData, timePerWeek: time })}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      formData.timePerWeek === time
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Формат обучения</h2>
              <p className="text-gray-600 mb-4">Как вы предпочитаете учиться?</p>
              <div className="space-y-2">
                {FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setFormData({ ...formData, format: format.id })}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      formData.format === format.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{format.name}</div>
                    <div className="text-sm text-gray-600">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Дополнительные пожелания</h2>
              <p className="text-gray-600 mb-4">Есть что добавить? (необязательно)</p>
              <textarea
                className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none focus:border-primary-600 focus:outline-none"
                rows={4}
                placeholder="Например: хочу больше примеров, нужны задания для практики..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              />
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={step === 1 ? () => navigate('/') : handleBack} className="flex-1">
            <ArrowLeft size={20} className="mr-2" />
            {step === 1 ? 'Отмена' : 'Назад'}
          </Button>

          {step < totalSteps ? (
            <Button variant="primary" onClick={handleNext} disabled={!canProceed()} className="flex-1">
              Далее
              <ArrowRight size={20} className="ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canProceed()}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Создать курс
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
