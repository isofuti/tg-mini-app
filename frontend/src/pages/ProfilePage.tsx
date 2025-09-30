import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/authStore';
import { Award, Star, User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <Layout title="Профиль">
      {/* User Info */}
      <Card variant="elevated" className="mb-6">
        <div className="flex items-center space-x-4">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="Avatar" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-primary-600" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            {user.username && <p className="text-gray-600">@{user.username}</p>}
          </div>
        </div>
      </Card>

      {/* Points Balance */}
      <Card variant="elevated" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Star size={24} className="text-yellow-500" />
              <h3 className="text-lg font-semibold">Ваши очки</h3>
            </div>
            <p className="text-sm text-gray-600">Используйте для скидок на курсы</p>
          </div>
          <div className="text-3xl font-bold text-primary-600">{user.pointsBalance}</div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Как использовать:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 100 очков = 10% скидка</li>
            <li>• 200 очков = 20% скидка</li>
            <li>• 500 очков = 50% скидка</li>
          </ul>
        </div>
      </Card>

      {/* Achievements */}
      <Card variant="elevated">
        <div className="flex items-center space-x-2 mb-4">
          <Award size={24} className="text-primary-600" />
          <h3 className="text-lg font-semibold">Достижения</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">За прохождение урока</p>
              <p className="text-xs text-gray-600">+1 очко</p>
            </div>
            <span className="text-2xl">📚</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">За викторину</p>
              <p className="text-xs text-gray-600">+2 очка</p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">За тест по теме</p>
              <p className="text-xs text-gray-600">+3 очка</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">За итоговую работу</p>
              <p className="text-xs text-gray-600">+4 очка</p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">За завершение курса</p>
              <p className="text-xs text-gray-600">+5 очков</p>
            </div>
            <span className="text-2xl">🎓</span>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
