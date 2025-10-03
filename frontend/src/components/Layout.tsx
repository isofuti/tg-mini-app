import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  title?: string;
}

export function Layout({ children, showNav = true, title }: LayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentPath = window.location.pathname;

  const navItems = [
    { icon: Home, label: 'Главная', path: '/' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-telegram-bg pb-20">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-10 bg-telegram-secondaryBg border-b border-gray-200/20">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-telegram-text">{title}</h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">{children}</main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-telegram-secondaryBg border-t border-gray-200/20 z-20">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                    {
                      'text-telegram-button': isActive,
                      'text-telegram-hint hover:text-telegram-text': !isActive,
                    }
                  )}
                >
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Points Badge (floating) */}
      {user && (
        <div className="fixed top-4 right-4 z-30">
          <div className="bg-primary-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
            <span className="text-sm font-bold">⭐</span>
            <span className="text-sm font-bold">{user.pointsBalance}</span>
          </div>
        </div>
      )}
    </div>
  );
}
