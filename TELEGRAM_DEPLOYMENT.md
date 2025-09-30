# 🚀 Запуск в Telegram - Полная инструкция

## 📋 Что нужно для запуска из Telegram

Telegram Mini Apps требуют:
1. ✅ **Backend доступен из интернета** (не localhost)
2. ✅ **Frontend доступен из интернета** (не localhost)
3. ✅ **HTTPS обязательно** (Telegram не работает с HTTP)
4. ✅ **Настройка Telegram Bot** через @BotFather

---

## 🌐 Вариант 1: Быстрый тест с ngrok (5 минут)

Для быстрого тестирования используйте **ngrok** - создаёт временный HTTPS туннель.

### Шаг 1: Установить ngrok
```powershell
# Скачать: https://ngrok.com/download
# Или через Chocolatey:
choco install ngrok
```

### Шаг 2: Запустить локальные сервисы
```powershell
cd C:\Users\Youngest\desktop\coursebot\tg-mini-app
docker-compose up -d
```

### Шаг 3: Создать туннели через ngrok

**Terminal 1 - Backend:**
```powershell
ngrok http 3000
```
Скопируйте URL, например: `https://abc123.ngrok-free.app`

**Terminal 2 - Frontend:**
```powershell
ngrok http 5173
```
Скопируйте URL, например: `https://xyz456.ngrok-free.app`

### Шаг 4: Обновить .env фронтенда
```powershell
# В docker-compose.yml или frontend/.env.local:
VITE_API_URL=https://abc123.ngrok-free.app
```

Пересобрать frontend:
```powershell
docker-compose restart frontend
```

### Шаг 5: Настроить Telegram Bot

1. Открыть **@BotFather** в Telegram
2. Отправить: `/mybots`
3. Выбрать: **@courceprat_bot**
4. Нажать: **Bot Settings** → **Menu Button**
5. Нажать: **Edit Menu Button URL**
6. Вставить ngrok URL фронтенда: `https://xyz456.ngrok-free.app`
7. Нажать: **Edit Menu Button Text**
8. Ввести: `Открыть курсы` или `Open Courses`

### Шаг 6: Тестировать!

1. Открыть **@courceprat_bot** в Telegram
2. Нажать кнопку **меню** (три линии) внизу
3. Выбрать **Открыть курсы**
4. Mini App откроется! 🎉

**⚠️ Ограничение:** ngrok туннели временные (8 часов бесплатно, URL меняется после перезапуска)

---

## 🏗️ Вариант 2: Production деплой (рекомендуется)

### Backend: Render / Railway

#### Render (бесплатный tier)

1. **Зарегистрироваться:** https://render.com
2. **Создать Web Service:**
   - Connect repository: `https://github.com/isofuti/tg-mini-app`
   - Root directory: `backend`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
3. **Добавить Environment Variables:**
   ```
   NODE_ENV=production
   DB_HOST=<render-postgres-host>
   DB_PORT=5432
   DB_NAME=telegram_courses
   DB_USER=<db-user>
   DB_PASSWORD=<db-password>
   REDIS_HOST=<redis-host>
   REDIS_PORT=6379
   JWT_SECRET=<генерируйте-случайную-строку-32-символа>
   TELEGRAM_BOT_TOKEN=8305290683:AAFH-pTMzMvW3j_dalLrhqkm5dkcOGsv0AI
   TELEGRAM_BOT_USERNAME=courceprat_bot
   LLM_API_URL=<ваш-LMStudio-URL-или-публичный-API>
   LLM_MODEL=openai/gpt-oss-20b
   ```
4. **Добавить PostgreSQL:**
   - Dashboard → New → PostgreSQL
   - Скопировать Internal Database URL в `DB_HOST`, `DB_NAME`, etc.
5. **Добавить Redis:**
   - Dashboard → New → Redis
   - Скопировать Internal Redis URL
6. **Deploy!**

Backend URL: `https://your-app.onrender.com`

#### Railway (альтернатива)

1. Регистрация: https://railway.app
2. New Project → Deploy from GitHub
3. Выбрать репозиторий
4. Добавить PostgreSQL + Redis через Railway Marketplace
5. Настроить Environment Variables
6. Deploy автоматически

---

### Frontend: Netlify / Vercel

#### Netlify (рекомендуется для Static SPA)

1. **Зарегистрироваться:** https://netlify.com
2. **New Site → Import from Git:**
   - Connect GitHub: `https://github.com/isofuti/tg-mini-app`
3. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. **Environment variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. **Deploy!**

Frontend URL: `https://your-app.netlify.app`

#### Vercel (альтернатива)

1. Регистрация: https://vercel.com
2. Import Git Repository
3. Framework Preset: `Vite`
4. Root Directory: `frontend`
5. Environment Variables: `VITE_API_URL`
6. Deploy

---

### Финальная настройка Telegram Bot

После деплоя backend + frontend:

1. Открыть **@BotFather**
2. `/mybots` → **@courceprat_bot**
3. **Bot Settings** → **Menu Button**
4. **Edit Menu Button URL:** `https://your-frontend.netlify.app`
5. **Edit Menu Button Text:** `Открыть курсы`

---

## 🔧 Настройка CORS

Backend должен разрешать запросы с фронтенда. В `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'https://your-frontend.netlify.app',
    'https://*.ngrok-free.app', // для тестирования
  ],
  credentials: true
}));
```

---

## 📊 Проверка что всё работает

### 1. Backend Health Check
```powershell
curl https://your-backend.onrender.com/health
```
Ожидается: `{"status":"ok","timestamp":"..."}`

### 2. Frontend открывается
Открыть в браузере: `https://your-frontend.netlify.app`

### 3. API доступен из фронтенда
```powershell
curl https://your-backend.onrender.com/api/catalog
```
Должен вернуть JSON с курсами

### 4. Telegram Bot
1. Открыть @courceprat_bot
2. Нажать кнопку меню
3. Mini App открывается с авторизацией через Telegram

---

## 🐛 Troubleshooting

### Проблема: CORS ошибка

**Console:** `Access to fetch has been blocked by CORS policy`

**Решение:** Добавить URL фронтенда в CORS настройки backend:
```typescript
app.use(cors({
  origin: ['https://your-frontend.netlify.app'],
  credentials: true
}));
```

### Проблема: Telegram не открывает Mini App

**Ошибка:** "This Mini App cannot be displayed"

**Причины:**
1. URL не HTTPS (обязательно HTTPS!)
2. Неправильный URL в @BotFather
3. Frontend не доступен (проверьте в браузере)

**Решение:**
- Проверить что URL точно HTTPS
- Открыть URL в браузере - должен открыться
- Перепроверить настройки в @BotFather

### Проблема: Backend не подключается к БД

**Логи:** `Failed to connect to PostgreSQL`

**Решение:**
1. Проверить Environment Variables (правильные ли?)
2. Проверить что PostgreSQL запущен
3. Проверить что IP разрешён (whitelist в Render/Railway)

### Проблема: LLM API недоступен

**Ошибка:** `Failed to generate content with LLM`

**LMStudio на локальной машине недоступен из облака!**

**Варианты:**
1. **ngrok для LMStudio:**
   ```powershell
   ngrok http 1234
   ```
   Использовать ngrok URL в `LLM_API_URL`

2. **Публичный API (замена):**
   - OpenAI API: `https://api.openai.com/v1`
   - Groq API: `https://api.groq.com/openai/v1`
   - Обновить `backend/src/services/yandexgpt.service.ts`

3. **VPS с LMStudio:**
   - Установить LMStudio на VPS с публичным IP
   - Использовать VPS IP в `LLM_API_URL`

---

## 📝 Пошаговый чеклист

### Перед деплоем:
- [ ] Backend запускается локально
- [ ] Frontend запускается локально
- [ ] Database schema применена
- [ ] .env.example проверен

### Деплой Backend:
- [ ] Backend задеплоен (Render/Railway)
- [ ] PostgreSQL подключен
- [ ] Redis подключен
- [ ] Environment variables настроены
- [ ] Health check работает: `/health`

### Деплой Frontend:
- [ ] Frontend задеплоен (Netlify/Vercel)
- [ ] `VITE_API_URL` указывает на backend
- [ ] Сайт открывается в браузере
- [ ] API запросы работают

### Настройка Telegram:
- [ ] @BotFather настроен с URL фронтенда
- [ ] Menu Button URL: `https://your-frontend.app`
- [ ] Menu Button Text: "Открыть курсы"
- [ ] Протестировано в Telegram

### Тестирование:
- [ ] Открывается через @courceprat_bot
- [ ] Авторизация через Telegram работает
- [ ] Каталог курсов загружается
- [ ] (Опционально) Создание курса работает

---

## 🎯 Рекомендуемая архитектура

```
┌─────────────────┐
│   Telegram Bot  │
│ @courceprat_bot │
└────────┬────────┘
         │
         │ Opens Mini App
         ▼
┌─────────────────┐      API Requests      ┌──────────────────┐
│   Frontend      │◄────────────────────────│   Backend        │
│   (Netlify)     │                         │   (Render)       │
│                 │                         │                  │
│ React + Vite    │                         │ Express + Node   │
│ Telegram SDK    │                         │ PostgreSQL       │
└─────────────────┘                         │ Redis            │
                                            │ LLM Integration  │
                                            └──────────────────┘
                                                     │
                                                     │ Generates courses
                                                     ▼
                                            ┌──────────────────┐
                                            │   LMStudio       │
                                            │   (ngrok/VPS)    │
                                            │                  │
                                            │ openai/gpt-oss   │
                                            └──────────────────┘
```

---

## ✅ После успешного деплоя

Ваше приложение будет:
- ✅ Доступно через @courceprat_bot в Telegram
- ✅ Авторизация автоматическая через Telegram
- ✅ Работать на любом устройстве (iOS/Android/Desktop)
- ✅ Иметь нативный Telegram UI

---

## 💡 Советы

1. **Используйте ngrok для быстрого тестирования** - 5 минут и готово
2. **Production деплой через Netlify + Render** - бесплатные tier'ы есть
3. **LMStudio нужен публичный доступ** - ngrok или VPS
4. **HTTPS обязателен** - без него Telegram не откроет
5. **Тестируйте в реальном Telegram** - браузер != Telegram Mini App

---

Если нужна помощь с конкретным шагом - пишите! 🚀
