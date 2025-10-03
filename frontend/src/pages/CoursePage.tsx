import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseStore } from '@/store/courseStore';
import { api } from '@/lib/api';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCourse, fetchCourse, isLoading } = useCourseStore();
  const [demoCourseData, setDemoCourseData] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Try to fetch as user course first
    fetchCourse(id).catch(() => {
      // If fails, try as demo course from catalog
      api.getCatalog()
        .then((data) => {
          const demoCourse = data.courses?.find((c: any) => c.id === id);
          if (demoCourse) {
            // Fetch full demo course details
            return fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/catalog/${id}`)
              .then(res => res.json())
              .then(fullData => {
                setDemoCourseData(fullData);
                setDemoLoading(false);
              });
          }
        })
        .catch((err) => {
          console.error('Failed to fetch demo course:', err);
          setDemoLoading(false);
        });
    });
  }, [id, fetchCourse]);

  // Use demo course data if available
  const courseData = demoCourseData || currentCourse;
  const loading = isLoading || demoLoading;

  if (loading && !courseData) {
    return (
      <Layout title="Загрузка...">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!courseData || (!demoCourseData?.course && !currentCourse)) {
    return (
      <Layout title="Ошибка">
        <Card><p className="text-center py-8 text-telegram-hint">Курс не найден</p></Card>
      </Layout>
    );
  }

  const course = demoCourseData?.course || courseData;
  const themes = demoCourseData?.themes || courseData?.themes || [];

  return (
    <Layout title={course?.title || 'Курс'}>
      {/* Course Header */}
      <Card variant="elevated" className="mb-6">
        {course?.description && <p className="text-telegram-hint mb-4">{course.description}</p>}
        {!demoCourseData && (
          <ProgressBar
            value={course?.completedLessons || 0}
            max={course?.totalLessons || 0}
            showLabel
          />
        )}
      </Card>

      {/* Themes List */}
      <div className="space-y-4">
        {themes?.map((theme: any) => (
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
                  className="w-full p-3 bg-telegram-secondaryBg hover:opacity-80 rounded-lg flex items-center justify-between transition-opacity"
                >
                  <div className="flex items-center">
                    {lesson.isCompleted ? (
                      <CheckCircle2 size={20} className="text-green-600 mr-2" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
                    )}
                    <span className="text-sm font-medium text-telegram-text">{lesson.title}</span>
                  </div>
                  <ArrowRight size={18} className="text-telegram-hint" />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
