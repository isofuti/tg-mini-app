# 🔧 Исправление Docker ошибки

## Проблема
```
ReferenceError: catalogRoutes is not defined
```

## Причина
Docker собрал образ со старой версией кода, где отсутствовал импорт `catalogRoutes`.

## ✅ Исправление (уже сделано)
- Добавлен импорт `catalogRoutes` в `backend/src/index.ts`
- Исправлен экспорт `LLMService` в `backend/src/services/yandexgpt.service.ts`
- Изменения закоммичены и загружены в GitHub

## 🚀 Как исправить у себя

### Шаг 1: Получить актуальный код
```powershell
# В директории проекта
git pull origin feature/mvp-implementation
```

### Шаг 2: Остановить и удалить старые контейнеры
```powershell
docker-compose down
```

### Шаг 3: Пересобрать образы с актуальным кодом
```powershell
docker-compose build --no-cache
```

### Шаг 4: Запустить контейнеры заново
```powershell
docker-compose up -d
```

### Шаг 5: Проверить логи backend
```powershell
docker-compose logs backend
```

Вы должны увидеть:
```
✅ Connected to PostgreSQL database
✅ Connected to Redis cache
🚀 Backend server running on http://localhost:3000
```

### Шаг 6: Проверить health endpoint
```powershell
curl http://localhost:3000/health
```

Ожидаемый ответ:
```json
{"status":"ok","timestamp":"2025-09-30T..."}
```

## 🔍 Альтернатива: Проверка без PowerShell curl

Если `curl` в PowerShell даёт ошибки, используйте:

```powershell
# Вариант 1: Invoke-WebRequest
Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -ExpandProperty Content

# Вариант 2: Открыть в браузере
start http://localhost:3000/health
```

## 📝 Проверка что всё работает

1. **Backend запущен:**
   ```powershell
   docker ps
   ```
   Вы должны увидеть контейнер `telegram_courses_backend` в статусе `Up`

2. **Логи без ошибок:**
   ```powershell
   docker-compose logs backend --tail 50
   ```

3. **Health check проходит:**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3000/health
   ```

4. **Все сервисы запущены:**
   ```powershell
   docker-compose ps
   ```
   
   Должно быть 4 контейнера:
   - telegram_courses_backend (Up)
   - telegram_courses_frontend (Up)
   - telegram_courses_db (Up, healthy)
   - telegram_courses_redis (Up, healthy)

## ❗ Если проблема осталась

### Проблема 1: Порты заняты
```powershell
# Проверить что порты свободны
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

Если порты заняты, либо остановите процессы, либо измените порты в `docker-compose.yml`

### Проблема 2: Docker образы не обновились
```powershell
# Полная очистка и пересборка
docker-compose down -v
docker rmi telegram-courses-app-backend telegram-courses-app-frontend
docker-compose build --no-cache
docker-compose up -d
```

### Проблема 3: Git не обновил файлы
```powershell
# Проверить текущую ветку
git branch

# Переключиться на правильную ветку
git checkout feature/mvp-implementation

# Жёсткий сброс к последней версии (ВНИМАНИЕ: удалит локальные изменения)
git reset --hard origin/feature/mvp-implementation

# Пересобрать Docker
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Последняя версия кода

Commit: `00da4eb` - "fix: Add missing catalogRoutes import and fix LLMService export"

Проверить что у вас эта версия:
```powershell
git log --oneline -1
```

Должно показать:
```
00da4eb fix: Add missing catalogRoutes import and fix LLMService export
```

## ✅ Готово!

После выполнения этих шагов backend должен запуститься без ошибок, и `curl http://localhost:3000/health` должен вернуть успешный ответ.
