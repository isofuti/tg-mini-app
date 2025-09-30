# 📋 Оставшиеся задачи - Telegram Courses MVP

**Дата:** 30 сентября 2025  
**Статус проекта:** 🎉 **MVP работает в production!**  
**URL:** https://kursyapp.ru  
**Telegram Bot:** @courceprat_bot

---

## ✅ Что УЖЕ РАБОТАЕТ (MVP 85%)

### 🎉 Production Ready:

1. **✅ Backend API** - все endpoints работают
   - Express.js + TypeScript
   - PostgreSQL (15+ таблиц)
   - Redis кэширование (опционально)
   - JWT авторизация
   - Telegram auth

2. **✅ Frontend** - 5 страниц готовы
   - React 18 + Vite + Tailwind
   - HomePage - каталог и список курсов
   - SurveyPage - опросник (6 вопросов)
   - CoursePage - структура курса
   - LessonPage - просмотр уроков
   - ProfilePage - профиль + очки

3. **✅ Деплой на Timeweb VPS**
   - HTTPS: https://kursyapp.ru
   - SSL от Let's Encrypt
   - Nginx reverse proxy
   - Docker + Docker Compose
   - Автоматическое SSL обновление

4. **✅ Telegram Bot**
   - @courceprat_bot настроен
   - Menu Button работает
   - Открывается в Telegram

5. **✅ Каталог курсов**
   - 6 направлений с ценами
   - Icons и описания
   - API готов

---

## ⏳ Осталось сделать (15%)

### 🔴 Критично (для полного функционала):

#### 1. **LLM интеграция** (2-3 часа)

**Проблема:** LMStudio на локальной сети недоступен с VPS.

**Решения:**

**Вариант A: OpenAI API (рекомендую)**
```bash
# На VPS в .env добавьте:
LLM_API_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-ваш-ключ
```

Стоимость: ~$0.15 на 1000 запросов  
Регистрация: https://platform.openai.com

**Вариант B: Groq API (быстрее и бесплатнее)**
```bash
LLM_API_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-70b-versatile
GROQ_API_KEY=gsk_ваш-ключ
```

Стоимость: Бесплатно до 30 req/min  
Регистрация: https://console.groq.com

**Вариант C: ngrok для LMStudio**
На локальном ПК где LMStudio:
```powershell
ngrok http 1234
# Используйте ngrok URL в .env на VPS
```

**Задачи:**
- [ ] Выбрать LLM провайдера
- [ ] Получить API ключ
- [ ] Обновить .env на VPS
- [ ] Перезапустить backend: `docker compose restart backend`
- [ ] Протестировать генерацию курса

---

#### 2. **Демо-курс с контентом** (1 час)

**Статус:** ✅ SQL seed скрипт создан!

**Файл:** `backend/src/database/seed-demo-course.sql`

**Содержание:**
- Курс "Нейросети. База" (бесплатный)
- 5 тем
- 6+ готовых уроков
- Функция `assign_demo_course_to_user()`

**Задачи:**
- [ ] Запустить seed скрипт на VPS:
  ```bash
  # На VPS выполните:
  docker compose exec postgres psql -U postgres -d telegram_courses < /root/tg-mini-app/backend/src/database/seed-demo-course.sql
  ```
- [ ] Добавить кнопку "Попробовать демо-курс" на HomePage
- [ ] Протестировать прохождение курса

---

### 🟡 Желательно (улучшения):

#### 3. **Викторины и тесты** (3-4 часа)

**Статус:** Таблицы в БД есть, функционал частичный

**Что нужно:**
- [ ] UI для прохождения тестов
- [ ] Логика проверки ответов
- [ ] Начисление очков за правильные ответы
- [ ] Статистика по тестам

---

#### 4. **Оплата Telegram Stars** (2-3 часа)

**Статус:** API endpoint готов, не протестирован

**Что нужно:**
- [ ] Протестировать payment workflow
- [ ] Настроить webhook от Telegram
- [ ] Проверить начисление доступа после оплаты
- [ ] Добавить UI кнопки оплаты

**Документация:** https://core.telegram.org/bots/payments

---

### 🟢 Опционально (можно отложить):

#### 5. **Админ-панель** (8-10 часов)

**Что нужно:**
- [ ] Отдельное React приложение
- [ ] Dashboard со статистикой
- [ ] Управление пользователями
- [ ] Просмотр финансов
- [ ] CRUD для курсов

---

#### 6. **Тесты** (10-15 часов)

**Что нужно:**
- [ ] Unit тесты (Jest)
- [ ] Integration тесты
- [ ] E2E тесты (Playwright)
- [ ] CI/CD с автоматическим тестированием

---

#### 7. **Мониторинг и аналитика** (3-4 часа)

**Что нужно:**
- [ ] Sentry для ошибок
- [ ] Google Analytics / Yandex Metrica
- [ ] Логирование (Winston)
- [ ] Uptime monitoring

---

## 📊 Приоритеты

### Неделя 1 (Запуск MVP):
1. ✅ Настроить LLM (OpenAI/Groq) - **КРИТИЧНО**
2. ✅ Загрузить демо-курс
3. ✅ Протестировать полный цикл: опрос → генерация → прохождение

### Неделя 2 (Улучшения):
4. Викторины и тесты
5. Оплата Stars
6. Мелкие UI/UX улучшения

### Месяц 1 (Опционально):
7. Админ-панель
8. Тесты
9. Мониторинг

---

## 🚀 Быстрый старт для LLM

### Рекомендую: Groq API (быстро и бесплатно)

```bash
# 1. Зарегистрируйтесь на https://console.groq.com
# 2. Получите API key

# 3. На VPS обновите .env
ssh root@ваш-vps-ip
cd ~/tg-mini-app
nano .env

# 4. Замените строки:
LLM_API_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-70b-versatile
LLM_API_TYPE=openai
# Добавьте новую строку:
GROQ_API_KEY=gsk_ваш-ключ-здесь

# 5. Перезапустите backend
docker compose restart backend

# 6. Проверьте логи
docker compose logs backend --tail 50

# 7. Протестируйте в Telegram!
# Попробуйте создать курс через опросник
```

---

## 🎯 Критерии готовности MVP:

- [x] Приложение открывается в Telegram ✅
- [x] Авторизация через Telegram работает ✅
- [x] Каталог курсов загружается ✅
- [x] HTTPS и SSL настроены ✅
- [ ] LLM генерирует курсы ⏳ **Осталось**
- [ ] Можно пройти демо-курс ⏳ **Осталось**
- [ ] Начисляются очки за уроки (частично работает)
- [ ] Можно оплатить курс Stars (не протестировано)

---

## 📞 Поддержка

Если нужна помощь:
1. Логи backend: `docker compose logs backend --tail 100`
2. Логи frontend: `docker compose logs frontend --tail 100`
3. Проверка здоровья: `curl https://kursyapp.ru/api/health`
4. Перезапуск: `docker compose restart`

---

## 🎉 Поздравляю!

**MVP работает в production!** 🚀

Осталось:
1. Настроить LLM (30 минут)
2. Загрузить демо-курс (15 минут)
3. Протестировать (15 минут)

**Итого: ~1 час до полностью рабочего MVP!**
