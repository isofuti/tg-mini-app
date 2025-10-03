import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLesson, fetchLesson, completeLesson, isLoading } = useCourseStore();
  const { refreshUser, user } = useAuthStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDemoLesson, setIsDemoLesson] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLesson(id).then(() => {
        // Check if this is a demo lesson by checking course ownership
        // Demo lessons don't belong to the user
        setIsDemoLesson(!currentLesson?.courseId || currentLesson?.courseId === '00000000-0000-0000-0000-000000000001');
      });
    }
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
        <div className="prose prose-sm max-w-none">
          {currentLesson.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="text-telegram-text"
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-telegram-text mb-4 mt-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-telegram-text mb-3 mt-5" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-telegram-text mb-2 mt-4" {...props} />,
                p: ({node, ...props}) => <p className="text-telegram-text mb-3 leading-relaxed" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline ? (
                    <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm" {...props} />
                  ) : (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm" {...props} />
                  ),
                pre: ({node, ...props}) => <pre className="mb-4 overflow-x-auto" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 text-telegram-text" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 text-telegram-text" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                a: ({node, ...props}) => <a className="text-telegram-link underline" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-telegram-button pl-4 italic my-4" {...props} />,
              }}
            >
              {currentLesson.content}
            </ReactMarkdown>
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
      ) : isDemoLesson ? (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
            Назад
          </Button>
          <Card variant="bordered" className="flex-1">
            <p className="text-center text-telegram-hint text-sm py-2">
              📚 Демо-урок - завершение недоступно
            </p>
          </Card>
        </div>
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
