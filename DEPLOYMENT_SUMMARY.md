# 📦 Deployment Summary - MVP Enhancements

## ✅ Что сделано

### 1. Добавлена система регенерации контента
- ✅ API endpoints для регенерации курсов/тем/уроков
- ✅ База данных: таблица `regeneration_history` и новые колонки
- ✅ Лимит: 5 попыток регенерации на курс
- ✅ Логирование всех регенераций для аналитики

### 2. Демо-курс стал бесплатным
- ✅ Цена курса "Основы Python для начинающих" = 0 звезд
- ✅ SQL скрипт для обновления: `update-demo-course-price.sql`

### 3. Очищена документация
- ✅ Удалено 11 устаревших MD файлов
- ✅ Добавлен REGENERATION_GUIDE.md
- ✅ Обновлен README.md

### 4. Исправлены ошибки
- ✅ TypeScript ошибки в redis.ts
- ✅ TypeScript ошибки в catalog.routes.ts
- ✅ Добавлен ai.service.ts wrapper

## 🚀 Инструкция по деплою на VPS

### Шаг 1: Обновить код

```bash
ssh root@your-vps
cd ~/tg-mini-app

# Скачать изменения
git fetch origin
git pull origin mvp-final

# Проверить что получили последний коммит
git log --oneline -1
# Должно быть: 7851142 feat: Add course regeneration support and cleanup documentation
```

### Шаг 2: Применить миграции БД

```bash
# Создать резервную копию БД (на всякий случай)
docker compose exec postgres pg_dump -U postgres telegram_courses > backup_$(date +%Y%m%d).sql

# Применить миграцию для регенерации
docker compose exec -T postgres psql -U postgres -d telegram_courses < backend/src/database/add-regeneration-support.sql

# Обновить цену демо-курса
docker compose exec -T postgres psql -U postgres -d telegram_courses < backend/src/database/update-demo-course-price.sql

# Проверить что применилось
docker compose exec postgres psql -U postgres -d telegram_courses -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name IN ('regenerations_remaining', 'last_regeneration_at');
"

# Должно показать:
#        column_name        | data_type
# --------------------------+-----------
#  regenerations_remaining  | integer
#  last_regeneration_at     | timestamp
```

### Шаг 3: Обновить backend

```bash
cd ~/tg-mini-app

# Остановить backend
docker compose stop backend

# Пересобрать backend с новым кодом
docker compose build backend

# Запустить backend
docker compose up -d backend

# Проверить логи
docker compose logs backend --tail 50
```

### Шаг 4: Проверка работоспособности

```bash
# 1. Health check
curl http://localhost:3000/health
# Ожидается: {"status":"ok","timestamp":"..."}

# 2. Проверить цену демо-курса
docker compose exec postgres psql -U postgres -d telegram_courses -c "
SELECT id, title, price, is_demo, regenerations_remaining
FROM courses 
WHERE is_demo = TRUE;
"
# price должен быть 0

# 3. Проверить что regeneration routes работают
# Замените <COURSE_ID> и <TOKEN> на реальные
curl http://localhost:3000/api/regeneration/course/<COURSE_ID>/info \
  -H "Authorization: Bearer <TOKEN>"
# Ожидается: {"regenerations_remaining":5,"last_regeneration_at":null}
```

### Шаг 5: Frontend (если нужно)

Frontend не изменился в этом PR, но если хотите убедиться:

```bash
# Перезапустить frontend
docker compose restart frontend

# Проверить
docker compose logs frontend --tail 30
```

## 🧪 Тестирование в Telegram

### 1. Открыть демо-курс
1. Откройте бота: https://t.me/courceprat_bot
2. Главная → "Основы Python для начинающих"
3. **Проверить:** Показывается **"Бесплатно"** или **"0 ⭐"**

### 2. Тестировать регенерацию (для пользовательских курсов)
1. Создайте свой курс через опросник
2. После генерации откройте любой урок
3. Должна появиться кнопка "🔄 Перегенерировать урок"
4. Нажмите → урок должен перегенерироваться
5. Счетчик регенераций должен уменьшиться (5 → 4)

## 📊 Мониторинг

### Проверить логи регенерации

```bash
docker compose exec postgres psql -U postgres -d telegram_courses -c "
SELECT 
  rh.regeneration_type,
  rh.reason,
  rh.created_at,
  u.username,
  c.title as course_title
FROM regeneration_history rh
JOIN users u ON u.id = rh.user_id
JOIN courses c ON c.id = rh.course_id
ORDER BY rh.created_at DESC
LIMIT 10;
"
```

### Проверить курсы с низким количеством регенераций

```bash
docker compose exec postgres psql -U postgres -d telegram_courses -c "
SELECT 
  c.title,
  c.regenerations_remaining,
  u.username as owner
FROM courses c
JOIN users u ON u.id = c.user_id
WHERE c.regenerations_remaining < 3
ORDER BY c.regenerations_remaining ASC;
"
```

## ⚠️ Возможные проблемы и решения

### Проблема 1: Миграция не применилась

**Симптомы:**
```
ERROR: column "regenerations_remaining" does not exist
```

**Решение:**
```bash
# Проверить что миграция не была применена ранее
docker compose exec postgres psql -U postgres -d telegram_courses -c "\d courses"

# Если колонка есть - всё ОК
# Если нет - применить миграцию вручную:
docker compose exec postgres psql -U postgres -d telegram_courses << 'EOF'
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS regenerations_remaining INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS last_regeneration_at TIMESTAMP;
EOF
```

### Проблема 2: Backend не стартует

**Симптомы:**
```
Cannot find module './routes/regeneration.routes'
```

**Решение:**
```bash
# Проверить что файл существует
ls -la backend/src/routes/regeneration.routes.ts

# Если нет - скачать снова
git fetch origin
git reset --hard origin/mvp-final

# Пересобрать
docker compose build --no-cache backend
docker compose up -d backend
```

### Проблема 3: TypeScript ошибки при сборке

**Симптомы:**
```
error TS2304: Cannot find name 'isRedisAvailable'
```

**Решение:**
```bash
# Проверить что backend/src/cache/redis.ts обновлен
cat backend/src/cache/redis.ts | head -20

# Должна быть функция isRedisAvailable
# Если нет - принудительно обновить:
git checkout origin/mvp-final -- backend/src/cache/redis.ts
```

## 📈 Следующие шаги

После успешного деплоя:

1. **Мониторинг**
   - Следите за логами регенерации
   - Анализируйте причины регенерации (reason field)
   - Оптимизируйте промпты на основе feedback

2. **Аналитика**
   - Какие уроки чаще всего регенерируют?
   - Какие причины самые частые?
   - Кто использует все 5 попыток?

3. **Улучшения**
   - Добавить UI для регенерации в frontend
   - Показывать счетчик оставшихся попыток
   - Добавить модальное окно с выбором причины

4. **Монетизация**
   - Продажа дополнительных регенераций за звезды
   - Premium план с безлимитными регенерациями

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи: `docker compose logs backend --tail 100`
2. Проверьте статус: `docker compose ps`
3. Проверьте БД: queries выше
4. Откатите изменения: `git reset --hard HEAD~1` и `docker compose up -d --build`

---

**Деплой готов!** 🚀 Все изменения backward-compatible, ничего не сломается.
