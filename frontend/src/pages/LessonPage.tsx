import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLesson, fetchLesson, completeLesson, isLoading } = useCourseStore();
  const { refreshUser } = useAuthStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) fetchLesson(id);
  }, [id, fetchLesson]);

  const handleComplete = async () => {
    if (!id || currentLesson?.isCompleted) return;

    setIsCompleting(true);
    try {
      const points = await completeLesson(id);
      setShowSuccess(true);
      refreshUser();

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      alert('Ошибка при завершении урока');
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout showNav={false} title="Загрузка...">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!currentLesson) {
    return (
      <Layout showNav={false} title="Ошибка">
        <Card><p className="text-center py-8 text-telegram-hint">Урок не найден</p></Card>
      </Layout>
    );
  }

  return (
    <Layout showNav={false} title={currentLesson.title}>
      <Card variant="elevated" className="mb-6">
        <div className="prose prose-sm max-w-none text-telegram-text">
          {currentLesson.content ? (
            <div dangerouslySetInnerHTML={{ __html: currentLesson.content.replace(/\n/g, '<br/>') }} />
          ) : (
            <p className="text-telegram-hint">Контент урока генерируется...</p>
          )}
        </div>
      </Card>

      {showSuccess ? (
        <Card variant="elevated" className="bg-green-50 border-green-200">
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Урок завершен! 🎉</h3>
            <p className="text-green-700">+1 очко добавлено</p>
          </div>
        </Card>
      ) : (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
            Назад
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={currentLesson.isCompleted}
            isLoading={isCompleting}
            className="flex-1"
          >
            {currentLesson.isCompleted ? 'Завершено ✓' : 'Завершить урок'}
          </Button>
        </div>
      )}
    </Layout>
  );
}
