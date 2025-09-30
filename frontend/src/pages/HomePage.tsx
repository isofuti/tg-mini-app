import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { courses, fetchCourses, isLoading } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Привет, {user?.firstName || 'Друг'}! 👋
        </h1>
        <p className="text-gray-600">
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

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Мои курсы</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : courses.length === 0 ? (
          <Card variant="bordered">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">У вас пока нет курсов</p>
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
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-gray-600">{course.description}</p>
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
