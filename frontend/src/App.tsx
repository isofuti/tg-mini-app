import { useEffect, useState } from 'react';
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
  const { isAuthenticated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Run only once on mount
    if (initialized) return;
    setInitialized(true);

    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Set theme colors (ignore version warnings)
    try {
      WebApp.setHeaderColor('secondary_bg_color');
      WebApp.setBackgroundColor('bg_color');
    } catch (e) {
      // Ignore version warnings in dev
    }

    // Auto-login with Telegram data
    if (WebApp.initDataUnsafe?.user) {
      const initData = WebApp.initData;
      useAuthStore.getState().login(initData).catch(console.error);
    } else {
      // DEV MODE: Allow testing without Telegram
      console.warn('⚠️ Running in DEV MODE without Telegram');
      console.log('💡 To test in Telegram: deploy and open via @courceprat_bot');
      
      // Skip auth for development
      if (import.meta.env.DEV) {
        setTimeout(() => {
          // Mock authentication for development
          useAuthStore.setState({
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: 'dev-user',
              telegramId: 123456789,
              username: 'devuser',
              firstName: 'Dev',
              lastName: 'User',
              pointsBalance: 100,
            }
          });
        }, 500);
      }
    }
  }, [initialized]);

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
