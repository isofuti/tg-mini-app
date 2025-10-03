import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses, fetchCourses, isLoading } = useCourseStore();
  const [demoCourses, setDemoCourses] = useState<any[]>([]);
  const [demoLoading, setDemoLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    
    // Fetch demo courses from public catalog
    api.getCatalog()
      .then((data) => {
        setDemoCourses(data.courses || []);
        setDemoLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch demo courses:', error);
        setDemoLoading(false);
      });
  }, [fetchCourses]);

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">
          Привет, {user?.firstName || 'Друг'}! 👋
        </h1>
        <p className="text-telegram-hint">
          Выбери курс или создай персонализированный под свои цели
        </p>
      </div>

      {/* Create New Course Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => navigate('/survey')}
        className="mb-8"
      >
        <Plus size={20} className="mr-2" />
        Создать новый курс
      </Button>

      {/* Demo Courses */}
      {!demoLoading && demoCourses.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-telegram-text">📚 Доступные курсы</h2>
          </div>

          {demoCourses.map((course) => (
            <Card
              key={course.id}
              variant="elevated"
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={18} className="text-telegram-button flex-shrink-0" />
                    <h3 className="font-semibold text-telegram-text">{course.title}</h3>
                  </div>
                  {course.description && (
                    <p className="text-sm text-telegram-hint">{course.description}</p>
                  )}
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded ml-2 flex-shrink-0">
                  БЕСПЛАТНО
                </span>
              </div>

              <div className="mt-3 flex items-center text-sm text-telegram-hint">
                <span>📖 {course.lessons_count || 0} уроков</span>
                <span className="mx-2">•</span>
                <span>📑 {course.themes_count || 0} тем</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-telegram-text">Мои курсы</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : !courses || courses.length === 0 ? (
          <Card variant="bordered">
            <div className="text-center py-8">
              <p className="text-telegram-hint mb-4">У вас пока нет своих курсов</p>
              <Button variant="outline" onClick={() => navigate('/survey')}>
                Создать первый курс
              </Button>
            </div>
          </Card>
        ) : (
          courses.map((course) => (
            <Card
              key={course.id}
              variant="elevated"
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-telegram-text mb-1">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-telegram-hint">{course.description}</p>
                  )}
                </div>
                {course.isDemo && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    ДЕМО
                  </span>
                )}
              </div>

              <ProgressBar
                value={course.completedLessons || 0}
                max={course.totalLessons || 0}
                showLabel
              />

              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>Статус: {getStatusText(course.status)}</span>
                <span>
                  {course.completedLessons || 0} / {course.totalLessons || 0} уроков
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Черновик',
    generating: 'Генерируется...',
    active: 'Активный',
    completed: 'Завершен',
    archived: 'Архивирован',
  };
  return statusMap[status] || status;
}
