import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

// Pages
import HomePage from './pages/HomePage';
import SurveyPage from './pages/SurveyPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';

// Hooks
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Set theme colors
    WebApp.setHeaderColor('secondary_bg_color');
    WebApp.setBackgroundColor('bg_color');

    // Auto-login with Telegram data
    if (WebApp.initDataUnsafe?.user) {
      const initData = WebApp.initData;
      login(initData).catch(console.error);
    }
  }, [login]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
