import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseStore } from '@/store/courseStore';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCourse, fetchCourse, isLoading } = useCourseStore();

  useEffect(() => {
    if (id) fetchCourse(id);
  }, [id, fetchCourse]);

  if (isLoading) {
    return (
      <Layout title="Загрузка...">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!currentCourse) {
    return (
      <Layout title="Ошибка">
        <Card><p className="text-center py-8 text-gray-500">Курс не найден</p></Card>
      </Layout>
    );
  }

  return (
    <Layout title={currentCourse.title}>
      {/* Course Header */}
      <Card variant="elevated" className="mb-6">
        {currentCourse.description && <p className="text-telegram-hint mb-4">{currentCourse.description}</p>}
        <ProgressBar
          value={currentCourse.completedLessons || 0}
          max={currentCourse.totalLessons || 0}
          showLabel
        />
      </Card>

      {/* Themes List */}
      <div className="space-y-4">
        {currentCourse.themes?.map((theme) => (
          <Card key={theme.id} variant="bordered">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-telegram-text">
                Тема {theme.themeNumber}: {theme.title}
              </h3>
            </div>

            {theme.description && (
              <p className="text-sm text-telegram-hint mb-3">{theme.description}</p>
            )}

            <div className="space-y-2">
              {theme.lessons?.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center">
                    {lesson.isCompleted ? (
                      <CheckCircle2 size={20} className="text-green-600 mr-2" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
                    )}
                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
