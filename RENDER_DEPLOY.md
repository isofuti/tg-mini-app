# 🚀 Деплой на Render.com - Пошаговая инструкция

## ✅ Обновления кода

Код обновлен для работы с Render:
- ✅ Поддержка `DATABASE_URL` (вместо отдельных переменных)
- ✅ Redis опционален (работает без него)
- ✅ SSL поддержка для PostgreSQL
- ✅ Graceful degradation при отсутствии Redis

---

## 📋 Шаг 1: Создайте PostgreSQL базу данных

1. Откройте: https://dashboard.render.com/
2. Нажмите: **New +** → **PostgreSQL**
3. Настройки:
   ```
   Name: telegram-courses-db
   Database: telegram_courses
   User: (автоматически)
   Region: Frankfurt (EU Central) или Oregon (US West)
   Plan: Free
   ```
4. Нажмите: **Create Database**
5. **Дождитесь создания** (2-3 минуты)
6. **Скопируйте "Internal Database URL"** (начинается с `postgres://`)

---

## 📋 Шаг 2: Создайте Web Service (Backend)

1. Нажмите: **New +** → **Web Service**
2. **Connect Repository:**
   - Connect account → GitHub
   - Выберите: `isofuti/tg-mini-app`
   - Нажмите: **Connect**

3. **Настройки:**
   ```
   Name: telegram-courses-backend
   Region: Frankfurt (EU Central) - ТОТ ЖЕ ЧТО И БАЗА!
   Branch: feature/mvp-implementation
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

4. **Advanced → Auto-Deploy:**
   - Включите: **Yes** (автоматический деплой при git push)

5. **НЕ НАЖИМАЙТЕ "Create Web Service" ЕЩЁ!**

---

## 📋 Шаг 3: Добавьте Environment Variables

Перед созданием сервиса, добавьте переменные окружения:

Нажмите **Advanced** → **Add Environment Variable**

### Обязательные переменные:

```bash
# Node Environment
NODE_ENV=production
PORT=10000

# Database (вставьте Internal Database URL из Шага 1)
DATABASE_URL=postgres://telegram_courses_user:XXXXX@dpg-xxxxx.frankfurt-postgres.render.com/telegram_courses

# JWT Secret (сгенерируйте случайный: https://generate-secret.vercel.app/32)
JWT_SECRET=ваш-супер-секретный-ключ-минимум-32-символа

# Telegram Bot
TELEGRAM_BOT_TOKEN=8305290683:AAFH-pTMzMvW3j_dalLrhqkm5dkcOGsv0AI
TELEGRAM_BOT_USERNAME=courceprat_bot

# Frontend URL (ваш ngrok URL или замените позже на Netlify)
FRONTEND_URL=https://miserable-renaldo-medicinally.ngrok-free.dev

# LLM Configuration (временно отключено - настроите позже)
LLM_API_URL=http://localhost:1234
LLM_MODEL=openai/gpt-oss-20b
LLM_API_TYPE=openai
```

### ⚠️ ВАЖНО про DATABASE_URL:
- Используйте **"Internal Database URL"** (не External)
- Internal URL быстрее и бесплатный
- Формат: `postgres://user:password@host/database`

---

## 📋 Шаг 4: Создайте Web Service

1. Проверьте что все переменные добавлены
2. Нажмите: **Create Web Service**
3. **Дождитесь деплоя** (5-10 минут для первого раза)

Render будет:
- ✅ Клонировать репозиторий
- ✅ Запускать `npm install`
- ✅ Запускать `npm run build`
- ✅ Запускать `npm start`

Следите за логами в реальном времени!

---

## 📋 Шаг 5: Инициализируйте базу данных

После успешного деплоя нужно создать таблицы:

### Вариант A: Через Render Shell (рекомендуется)

1. На странице Web Service нажмите: **Shell** (вверху справа)
2. Выполните:
   ```bash
   # Подключитесь к БД
   psql $DATABASE_URL
   
   # Скопируйте содержимое backend/src/database/schema.sql
   # Вставьте в psql и нажмите Enter
   
   # Проверьте что таблицы созданы:
   \dt
   
   # Выйдите:
   \q
   ```

### Вариант B: Через psql локально

```powershell
# Скопируйте External Database URL из Render Dashboard

# Подключитесь
psql "postgres://user:pass@host/db"

# Выполните schema.sql
\i C:/Users/Youngest/desktop/coursebot/tg-mini-app/backend/src/database/schema.sql

# Проверьте
\dt

# Выйдите
\q
```

---

## 📋 Шаг 6: Проверьте что backend работает

### Скопируйте ваш Render URL:
```
https://telegram-courses-backend.onrender.com
```

### Проверьте health endpoint:

```powershell
curl.exe https://telegram-courses-backend.onrender.com/health
```

**Ожидаемый ответ:**
```json
{"status":"ok","timestamp":"2025-01-..."}
```

✅ Если видите это - backend работает!

---

## 📋 Шаг 7: Обновите локальный .env

```powershell
cd C:\Users\Youngest\Desktop\coursebot\tg-mini-app
notepad .env
```

Измените:
```bash
# Backend URL для frontend
VITE_API_URL=https://telegram-courses-backend.onrender.com

# Frontend URL (ваш ngrok)
FRONTEND_URL=https://miserable-renaldo-medicinally.ngrok-free.dev

# Остальное без изменений
```

**Сохраните файл!**

---

## 📋 Шаг 8: Обновите FRONTEND_URL в Render

Нужно чтобы backend знал откуда приходят запросы (CORS).

1. Откройте: Render Dashboard → telegram-courses-backend
2. Environment → **Edit**
3. Найдите: `FRONTEND_URL`
4. Убедитесь что там ваш ngrok URL: `https://miserable-renaldo-medicinally.ngrok-free.dev`
5. **Save Changes**

Render автоматически передеплоит (~2 минуты).

---

## 📋 Шаг 9: Перезапустите frontend локально

```powershell
cd C:\Users\Youngest\Desktop\coursebot\tg-mini-app

# Остановить
docker-compose down

# Запустить с новыми переменными
docker-compose up -d

# Проверить
docker ps

# Подождать 20 секунд
timeout /t 20
```

---

## 📋 Шаг 10: Тестируйте в Telegram! 🎉

1. Откройте **@courceprat_bot** в Telegram
2. Нажмите **меню** (≡)
3. Откройте **"Открыть курсы"**

### Теперь должно работать:
- ✅ Авторизация через Telegram
- ✅ Загрузка профиля пользователя
- ✅ Просмотр каталога курсов
- ✅ Создание курсов (опрос)
- ⚠️ Генерация уроков через LLM (пока отключена)

---

## 🔧 Troubleshooting

### Проблема: Backend логи показывают "Database connection error"

**Решение:**
- Проверьте что `DATABASE_URL` правильный (Internal Database URL)
- Убедитесь что база данных в статусе "Available"
- Region backend и базы должны совпадать

### Проблема: CORS ошибка в браузере

**Решение:**
```bash
# В Render Environment variables проверьте:
FRONTEND_URL=https://ваш-точный-ngrok-url
```

Render требует точное совпадение URL (включая https://).

### Проблема: "Cannot read properties of undefined"

**Решение:**
```powershell
# Обновите код
git pull origin feature/mvp-implementation
docker-compose restart frontend
```

### Проблема: Render service не запускается

**Логи показывают ошибку?**
1. Откройте: Render Dashboard → telegram-courses-backend → Logs
2. Найдите красную ошибку
3. Скопируйте и покажите мне

### Проблема: Бесплатный tier Render "засыпает" через 15 минут

**Это нормально!** При первом запросе он "проснётся" (30-60 секунд).

**Решение для production:**
- Upgrade до Starter plan ($7/мес) - остается всегда активным
- Или используйте Railway.app, Fly.io (похожие бесплатные планы)

---

## 📊 Статус после деплоя

| Компонент | Хостинг | URL | Статус |
|-----------|---------|-----|--------|
| **Backend** | Render | `https://telegram-courses-backend.onrender.com` | ✅ Production |
| **Frontend** | ngrok | `https://miserable-renaldo-medicinally.ngrok-free.dev` | ⚠️ Temporary |
| **Database** | Render PostgreSQL | Internal only | ✅ Production |
| **Redis** | - | - | ⚠️ Disabled (optional) |

---

## 🚀 Следующие шаги

### Краткосрочные:
1. ✅ Задеплоить backend на Render (сделано!)
2. ⏳ Протестировать полный функционал
3. ⏳ Задеплоить frontend на Netlify (постоянный URL)
4. ⏳ Настроить LMStudio через ngrok или использовать OpenAI API

### Долгосрочные:
- Добавить demo курсы в базу (seed data)
- Настроить мониторинг (Render встроенный)
- Добавить Redis через Upstash (бесплатно 10K запросов/день)
- Production deployment финал

---

## ✅ Чеклист

- [ ] PostgreSQL база создана на Render
- [ ] Web Service создан и задеплоен
- [ ] DATABASE_URL настроен в Environment Variables
- [ ] Таблицы созданы в базе (schema.sql)
- [ ] `/health` endpoint возвращает 200 OK
- [ ] Локальный .env обновлен с Render URL
- [ ] Frontend перезапущен с новыми переменными
- [ ] Приложение открывается в Telegram
- [ ] Авторизация работает

---

Если на каком-то шаге застряли - дайте знать! Помогу разобраться. 🚀
