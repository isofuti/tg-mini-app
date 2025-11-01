# 🔧 Frontend Dev Mode - Исправление бесконечной загрузки

## Проблема
Frontend висел на бесконечной загрузке при открытии `http://localhost:5173` в браузере.

## Причина
Приложение ждало данные авторизации от Telegram WebApp, но в обычном браузере (не в Telegram) эти данные недоступны.

## ✅ Исправление (сделано)
Добавлен **DEV MODE** для тестирования без Telegram:
- Mock авторизация с тестовым пользователем
- Игнорирование предупреждений о версии Telegram SDK
- Информативные console warnings

## 🚀 Как обновить и протестировать

### Шаг 1: Получить исправленный код
```powershell
cd C:\Users\Youngest\desktop\coursebot\tg-mini-app
git pull origin feature/mvp-implementation
```

### Шаг 2: Пересобрать frontend контейнер
```powershell
# Остановить
docker-compose stop frontend

# Пересобрать
docker-compose build --no-cache frontend

# Запустить
docker-compose up -d frontend
```

### Шаг 3: Проверить в браузере
Откройте: http://localhost:5173

**Теперь должно загрузиться!** 🎉

В консоли браузера вы увидите:
```
⚠️ Running in DEV MODE without Telegram
💡 To test in Telegram: deploy and open via @courceprat_bot
```

## 🧪 Режимы работы

### 1. DEV Mode (браузер)
- **URL**: http://localhost:5173
- **Авторизация**: Mock пользователь (автоматически)
- **Пользователь**: Dev User (123456789)
- **Баланс очков**: 100
- **Для**: Тестирование UI и навигации

### 2. Production Mode (Telegram)
- **Открывается через**: @courceprat_bot
- **Авторизация**: Реальная через Telegram
- **Пользователь**: Ваш Telegram аккаунт
- **Для**: Реальное тестирование с LMStudio

## 📋 Что можно тестировать в DEV режиме

✅ **Работает:**
- Навигация по страницам
- UI компоненты
- Просмотр каталога курсов (`/api/catalog` через backend)
- Просмотр профиля
- Layout и дизайн

⚠️ **Ограничено:**
- Создание реальных курсов (требует backend + LMStudio)
- Telegram-специфичные функции (кнопки, haptic feedback)
- Реальная авторизация

❌ **Не работает:**
- Telegram UI элементы (MainButton, BackButton)
- Telegram theme colors (будут предупреждения, но не критично)

## 🔍 Проверка что всё работает

### 1. Откройте http://localhost:5173
Должны увидеть главную страницу с курсами

### 2. Проверьте консоль браузера (F12)
Должны быть:
```
⚠️ Running in DEV MODE without Telegram
💡 To test in Telegram: deploy and open via @courceprat_bot
```

### 3. Проверьте навигацию
- Главная: список курсов
- Профиль: кнопка в верхнем углу
- Курсы: клик на курс

### 4. Проверьте API запросы (Network tab)
```
GET http://localhost:3000/api/catalog - должен вернуть 200 OK
```

## 📝 Mock пользователь (DEV режим)

```json
{
  "id": "dev-user",
  "telegramId": 123456789,
  "username": "devuser",
  "firstName": "Dev",
  "lastName": "User",
  "pointsBalance": 100
}
```

Этот пользователь создаётся автоматически при загрузке в DEV режиме.

## 🚀 Deployment в Telegram (Production)

Для полного тестирования нужно:

### 1. Deploy Backend
```powershell
# Backend должен быть доступен из интернета
# Варианты: Render, Railway, VPS, Ngrok
```

### 2. Deploy Frontend
```powershell
# Frontend должен быть доступен из интернета
# Варианты: Netlify, Vercel, GitHub Pages
```

### 3. Настроить Bot
```
1. Открыть @BotFather в Telegram
2. Выбрать @courceprat_bot
3. /setmenubutton
4. Указать URL фронтенда
```

### 4. Открыть в Telegram
```
1. Открыть @courceprat_bot
2. Нажать на кнопку меню
3. Mini App откроется с реальной авторизацией
```

## ❓ Troubleshooting

### Проблема: Всё ещё бесконечная загрузка

**Решение:**
```powershell
# 1. Проверить версию кода
git log --oneline -1
# Должно быть: "fix: Add dev mode for testing frontend without Telegram"

# 2. Жёсткая пересборка
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# 3. Очистить кеш браузера
# Ctrl+Shift+Delete -> Очистить всё
```

### Проблема: Ошибки в консоли браузера

**Telegram SDK warnings** - нормально, игнорируйте:
```
[Telegram.WebApp] Header color is not supported in version 6.0
[Telegram.WebApp] Background color is not supported in version 6.0
```

**API ошибки** - проверьте что backend запущен:
```powershell
curl.exe http://localhost:3000/health
```

### Проблема: Страница пустая

**Проверьте:**
1. Console errors (F12)
2. Network requests (Network tab)
3. Backend logs: `docker-compose logs backend`

## ✅ Что дальше?

После того как frontend загрузится в браузере:

1. **Протестируйте UI** - навигация, дизайн, компоненты
2. **Проверьте API** - `/api/catalog` должен отдавать курсы
3. **Настройте LMStudio** - для генерации курсов
4. **Deploy в Telegram** - для полного тестирования
5. **Создайте PR** на GitHub (если ещё не создали)

---

**Commit**: Latest fix commit - "fix: Add dev mode for testing frontend without Telegram"

Frontend теперь работает в DEV режиме! 🎉
