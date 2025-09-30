# 🎓 Telegram Mini App - AI-Generated Courses

Платформа для создания и прохождения персонализированных образовательных курсов, генерируемых с помощью YandexGPT.

## 🚀 Особенности

- 🤖 **AI-генерация курсов**: Персонализированные курсы создаются на основе индивидуальных потребностей
- 📱 **Telegram Mini App**: Нативная интеграция с Telegram
- 🎮 **Геймификация**: Система очков и достижений
- 📊 **Прогресс**: Отслеживание прогресса обучения
- 💰 **Монетизация**: Оплата через Telegram Stars
- 🎯 **6+ направлений**: Tilda, промпт-инжиниринг, нейросети, веб-разработка, боты

## 📁 Структура проекта

```
telegram-courses-app/
├── backend/          # Node.js/Express API сервер
├── frontend/         # React + Vite Telegram Mini App
├── admin/            # Админ-панель
├── database/         # PostgreSQL схемы и миграции
└── docs/             # Документация
```

## 🛠 Технологический стек

### Backend
- **Runtime**: Bun 1.2+ (совместимо с Node.js 20+)
- **Framework**: Express.js
- **Database**: PostgreSQL 15 + Redis 7
- **AI**: LMStudio (OpenAI-compatible API) - openai/gpt-oss-20b
- **Payment**: Telegram Stars API (в разработке)

### Frontend
- **Framework**: React 18
- **Build**: Vite 5
- **UI**: Tailwind CSS (минималистичный Telegram-стиль)
- **State**: Zustand
- **Telegram**: @twa-dev/sdk
- **Icons**: lucide-react

### Deployment
- **Containers**: Docker + Docker Compose
- **Frontend**: Netlify / Nginx
- **Backend**: Render / VPS

## 🚀 Быстрый старт

### Требования
- Node.js 20+ или Bun 1.0+
- PostgreSQL 14+
- Redis 7+
- Yandex Cloud аккаунт (для YandexGPT)

### Установка

1. **Клонирование репозитория**
```bash
git clone <repo-url>
cd telegram-courses-app
```

2. **Установка зависимостей**
```bash
bun install
```

3. **Настройка окружения**
```bash
# Скопируйте примеры конфигов
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Отредактируйте .env файлы с вашими ключами
```

4. **Инициализация базы данных**
```bash
cd backend
bun run db:migrate
bun run db:seed
```

5. **Запуск в режиме разработки**
```bash
# Из корневой папки
bun run dev
```

Backend будет доступен на `http://localhost:3000`  
Frontend будет доступен на `http://localhost:5173`

## 📦 Деплой

### С использованием Docker

```bash
docker-compose up -d
```

### Ручной деплой

См. подробные инструкции в [docs/deployment.md](docs/deployment.md)

## 📚 Документация

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Frontend Architecture](docs/frontend.md)
- [Admin Panel Guide](docs/admin.md)
- [Deployment Guide](docs/deployment.md)

## 🧪 Тестирование

```bash
# Запуск всех тестов
bun test

# Запуск тестов с покрытием
bun test --coverage
```

## 📝 MVP Scope (Этап 1)

- ✅ Авторизация через Telegram
- ✅ Опросник и генерация структуры курса
- ✅ Генерация текстовых уроков
- ✅ Базовый личный кабинет
- ✅ Система начисления очков
- ✅ Демо-курс
- ✅ Базовая админ-панель

## 🗓 Roadmap

### Этап 2 (Расширение)
- [ ] Викторины и тесты
- [ ] Итоговая работа
- [ ] Оплата через Telegram Stars
- [ ] Использование очков (скидки)
- [ ] Уведомления
- [ ] Расширенная статистика

### Этап 3 (Улучшения)
- [ ] Ручная проверка работ
- [ ] Продвинутая аналитика
- [ ] Оптимизация производительности
- [ ] UI/UX улучшения

## 🤝 Вклад

Этот проект находится в активной разработке. Предложения и PR приветствуются!

## 📄 Лицензия

Proprietary - все права защищены

## 📞 Контакты

Для вопросов и поддержки: [контакты]

---

**Создано с ❤️ с использованием AI**
