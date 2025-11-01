# 🚀 Деплой на Timeweb VPS - Полная инструкция

## 📋 Что вы получите

- ✅ Свой сервер с постоянным IP
- ✅ Backend + Frontend + PostgreSQL + Redis на одном сервере
- ✅ HTTPS с бесплатным SSL сертификатом
- ✅ Автоматические обновления через `git pull`
- ✅ Полный контроль над приложением

**Стоимость:** От 290₽/мес  
**Время деплоя:** 15-20 минут  
**Сложность:** ⭐⭐ Средняя (следуйте инструкциям)

---

## 📋 Шаг 1: Создание VPS на Timeweb (5 минут)

### 1.1 Регистрация

1. Откройте: https://timeweb.cloud/
2. Нажмите: **"Зарегистрироваться"** (правый верхний угол)
3. Заполните форму:
   - Email
   - Телефон (для подтверждения)
   - Пароль
4. Подтвердите email и телефон

### 1.2 Пополнение баланса

1. Войдите в панель: https://timeweb.cloud/my/
2. Перейдите: **"Баланс"** → **"Пополнить"**
3. Пополните на 300-600₽ (хватит на 1-2 месяца)
4. Оплата: Карта РФ, ЮMoney, QIWI, Криптовалюта

### 1.3 Создание VPS

1. В панели нажмите: **"Создать"** → **"Облачный сервер"**
2. **Выберите конфигурацию:**

   **Рекомендуемый тариф для начала:**
   ```
   ⚙️ CPU: 2 ядра
   💾 RAM: 2 GB
   💿 SSD: 20 GB
   💰 Цена: ~290₽/мес
   ```

   **Если ожидаете много пользователей:**
   ```
   ⚙️ CPU: 4 ядра
   💾 RAM: 4 GB
   💿 SSD: 40 GB
   💰 Цена: ~590₽/мес
   ```

3. **Операционная система:**
   - Выберите: **Ubuntu 22.04 LTS**
   - ✅ Стабильная, проверенная
   - ✅ Долгосрочная поддержка до 2027

4. **Регион:**
   - Выберите: **Москва** или **Санкт-Петербург**
   - Ближе к вашим пользователям = быстрее

5. **SSH ключи (опционально):**
   - Пока пропустите, используем пароль

6. **Имя сервера:**
   ```
   telegram-courses-prod
   ```

7. Нажмите: **"Заказать сервер"**

### 1.4 Получение доступов

Через 1-2 минуты сервер создастся. Вы получите:

```
IP адрес: 123.456.789.012
Логин: root
Пароль: (на email и в панели Timeweb)
```

**Сохраните эти данные!**

---

## 📋 Шаг 2: Подключение к серверу (3 минуты)

### Windows (через PuTTY)

**2.1 Скачайте PuTTY:**
- https://www.putty.org/
- Или: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html

**2.2 Подключитесь:**
1. Откройте PuTTY
2. **Host Name:** Введите IP адрес вашего VPS (например: `123.456.789.012`)
3. **Port:** `22`
4. **Connection type:** SSH
5. Нажмите: **Open**
6. При первом подключении появится предупреждение → **Accept**
7. **login as:** `root`
8. **password:** Вставьте пароль из Timeweb (правая кнопка мыши)

### Windows (через PowerShell)

```powershell
ssh root@123.456.789.012
# Введите пароль когда попросит
```

### Успешное подключение

Вы увидите:
```bash
Welcome to Ubuntu 22.04 LTS
root@telegram-courses-prod:~#
```

✅ Вы на сервере!

---

## 📋 Шаг 3: Установка Docker (5 минут)

Скопируйте и выполните команды **по очереди**:

### 3.1 Обновление системы

```bash
apt update && apt upgrade -y
```

### 3.2 Установка Docker

```bash
# Скачать установочный скрипт
curl -fsSL https://get.docker.com -o get-docker.sh

# Запустить установку
sh get-docker.sh

# Проверить что Docker установлен
docker --version
# Должно показать: Docker version 24.x.x
```

### 3.3 Установка Docker Compose

```bash
# Установить Docker Compose v2
apt install docker-compose-plugin -y

# Проверить
docker compose version
# Должно показать: Docker Compose version v2.x.x
```

✅ Docker готов!

---

## 📋 Шаг 4: Загрузка кода проекта (2 минуты)

### 4.1 Установка Git

```bash
apt install git -y
```

### 4.2 Клонирование репозитория

```bash
# Перейти в домашнюю директорию
cd ~

# Клонировать проект
git clone https://github.com/isofuti/tg-mini-app.git

# Перейти в папку
cd tg-mini-app

# Переключиться на правильную ветку
git checkout feature/mvp-implementation

# Проверить что файлы на месте
ls -la
# Должны видеть: docker-compose.yml, backend/, frontend/, README.md
```

✅ Код загружен!

---

## 📋 Шаг 5: Настройка переменных окружения (3 минуты)

### 5.1 Создание .env файла

```bash
# Скопировать пример
cp .env.example .env

# Открыть для редактирования
nano .env
```

### 5.2 Настройка переменных

Замените следующие значения:

```bash
# Backend Configuration
JWT_SECRET=сгенерируйте-случайную-строку-минимум-32-символа
TELEGRAM_BOT_TOKEN=8305290683:AAFH-pTMzMvW3j_dalLrhqkm5dkcOGsv0AI
TELEGRAM_BOT_USERNAME=courceprat_bot

# LMStudio Configuration (пока оставьте как есть)
LLM_API_URL=http://192.168.3.199:1234
LLM_MODEL=openai/gpt-oss-20b
LLM_API_TYPE=openai

# Frontend URL - ВАЖНО!
# Замените 123.456.789.012 на ваш IP адрес VPS
FRONTEND_URL=http://123.456.789.012:5173

# Frontend API URL
# Замените 123.456.789.012 на ваш IP адрес VPS
VITE_API_URL=http://123.456.789.012:3000
```

**Генерация JWT_SECRET:**
```bash
# Вариант 1: На сервере
openssl rand -base64 32

# Вариант 2: Онлайн
# Откройте: https://generate-secret.vercel.app/32
```

### 5.3 Сохранение файла

1. Нажмите: **Ctrl+O** (сохранить)
2. Нажмите: **Enter** (подтвердить имя файла)
3. Нажмите: **Ctrl+X** (выйти из nano)

✅ Переменные настроены!

---

## 📋 Шаг 6: Запуск приложения (2 минуты)

### 6.1 Запуск Docker Compose

```bash
# Убедитесь что вы в папке проекта
cd ~/tg-mini-app

# Запустить все контейнеры
docker compose up -d

# Проверить что запустились
docker compose ps
```

Вы должны увидеть 4 контейнера:
```
NAME                            STATUS
telegram_courses_backend        Up (healthy)
telegram_courses_frontend       Up
telegram_courses_db             Up (healthy)
telegram_courses_redis          Up (healthy)
```

### 6.2 Просмотр логов

```bash
# Логи всех контейнеров
docker compose logs

# Логи конкретного сервиса
docker compose logs backend
docker compose logs frontend

# Следить за логами в реальном времени
docker compose logs -f backend
# Ctrl+C для выхода
```

### 6.3 Проверка работы

```bash
# Проверить backend health
curl http://localhost:3000/health
# Должно вернуть: {"status":"ok",...}

# Проверить что порты открыты
netstat -tulpn | grep -E '3000|5173'
```

✅ Приложение запущено!

---

## 📋 Шаг 7: Открытие портов в файрволе (2 минуты)

### 7.1 Настройка UFW (Firewall)

```bash
# Установить UFW если его нет
apt install ufw -y

# Разрешить SSH (ВАЖНО! Иначе потеряете доступ)
ufw allow 22/tcp

# Разрешить порты приложения
ufw allow 3000/tcp  # Backend API
ufw allow 5173/tcp  # Frontend

# Включить файрвол
ufw --force enable

# Проверить статус
ufw status
```

Вы должны увидеть:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
3000/tcp                   ALLOW       Anywhere
5173/tcp                   ALLOW       Anywhere
```

### 7.2 Открытие портов в панели Timeweb

1. Откройте: https://timeweb.cloud/my/servers
2. Выберите ваш сервер
3. Перейдите в: **"Настройки"** → **"Файрвол"**
4. Добавьте правила:
   ```
   Порт 22   - SSH
   Порт 3000 - Backend
   Порт 5173 - Frontend
   ```
5. Нажмите: **"Сохранить"**

✅ Порты открыты!

---

## 📋 Шаг 8: Проверка доступа из интернета (1 минута)

### 8.1 Получите ваш IP адрес VPS

```bash
# На сервере выполните:
curl ifconfig.me
# Вернет ваш публичный IP, например: 123.456.789.012
```

### 8.2 Проверьте с вашего компьютера

```powershell
# Windows PowerShell
curl.exe http://123.456.789.012:3000/health

# Должно вернуть: {"status":"ok",...}
```

### 8.3 Откройте frontend в браузере

```
http://123.456.789.012:5173
```

Должна загрузиться страница приложения!

✅ Приложение доступно из интернета!

---

## 📋 Шаг 9: Настройка @BotFather (2 минуты)

### 9.1 Обновите Menu Button URL

1. Откройте **@BotFather** в Telegram
2. Отправьте: `/mybots`
3. Выберите: **@courceprat_bot**
4. Нажмите: **Bot Settings**
5. Нажмите: **Menu Button**
6. Нажмите: **Edit Menu Button URL**
7. **Вставьте URL вашего frontend:**
   ```
   http://123.456.789.012:5173
   ```
8. Нажмите: **Edit Menu Button Text**
9. Введите: `Открыть курсы`

### 9.2 Протестируйте!

1. Откройте **@courceprat_bot** в Telegram
2. Нажмите **кнопку меню** (≡) внизу
3. Выберите **"Открыть курсы"**
4. Приложение должно открыться! 🎉

---

## 📋 Шаг 10: Настройка домена и SSL (Опционально, 15 минут)

### Зачем нужен домен?

- ✅ Красивый URL: `courses.yoursite.ru` вместо `123.456.789.012:5173`
- ✅ HTTPS вместо HTTP (безопасно)
- ✅ Не нужно запоминать IP адрес

### 10.1 Покупка домена

**Где купить (РФ):**
- REG.RU - от 99₽/год (.ru)
- Timeweb - от 149₽/год (.ru)
- nic.ru - от 199₽/год (.ru)

### 10.2 Настройка DNS

В панели управления доменом добавьте **A-записи:**

```
Имя: @
Тип: A
Значение: 123.456.789.012
TTL: 3600

Имя: www
Тип: A
Значение: 123.456.789.012
TTL: 3600

Имя: api
Тип: A
Значение: 123.456.789.012
TTL: 3600
```

**Подождите 5-30 минут** для распространения DNS.

### 10.3 Установка Nginx и SSL

На сервере выполните:

```bash
# Установить Nginx
apt install nginx -y

# Установить Certbot (для SSL)
apt install certbot python3-certbot-nginx -y
```

### 10.4 Настройка Nginx конфигурации

```bash
# Создать конфиг для frontend
nano /etc/nginx/sites-available/telegram-courses-frontend
```

Вставьте:
```nginx
server {
    listen 80;
    server_name yoursite.ru www.yoursite.ru;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Сохраните (Ctrl+O, Enter, Ctrl+X).

```bash
# Создать конфиг для backend API
nano /etc/nginx/sites-available/telegram-courses-api
```

Вставьте:
```nginx
server {
    listen 80;
    server_name api.yoursite.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Сохраните (Ctrl+O, Enter, Ctrl+X).

### 10.5 Активация конфигураций

```bash
# Создать симлинки
ln -s /etc/nginx/sites-available/telegram-courses-frontend /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/telegram-courses-api /etc/nginx/sites-enabled/

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx
```

### 10.6 Получение SSL сертификата

```bash
# Получить сертификаты для обоих доменов
certbot --nginx -d yoursite.ru -d www.yoursite.ru -d api.yoursite.ru

# Следуйте инструкциям:
# 1. Введите email
# 2. Согласитесь с Terms of Service (Y)
# 3. Выберите: Redirect (2) - автоматический редирект на HTTPS
```

### 10.7 Обновите .env с новыми URL

```bash
cd ~/tg-mini-app
nano .env
```

Измените:
```bash
FRONTEND_URL=https://yoursite.ru
VITE_API_URL=https://api.yoursite.ru
```

Сохраните и перезапустите:
```bash
docker compose down
docker compose up -d
```

### 10.8 Обновите @BotFather

Теперь URL в @BotFather:
```
https://yoursite.ru
```

✅ HTTPS настроен!

---

## 📋 Обслуживание и обновления

### Просмотр логов

```bash
# Все логи
docker compose logs

# Последние 100 строк backend
docker compose logs --tail 100 backend

# Следить за логами в реальном времени
docker compose logs -f
```

### Перезапуск сервисов

```bash
# Перезапустить всё
docker compose restart

# Перезапустить только backend
docker compose restart backend

# Перезапустить только frontend
docker compose restart frontend
```

### Обновление кода

```bash
cd ~/tg-mini-app

# Получить последние изменения
git pull origin feature/mvp-implementation

# Пересобрать и перезапустить
docker compose down
docker compose up -d --build
```

### Просмотр использования ресурсов

```bash
# Использование Docker контейнерами
docker stats

# Общая статистика сервера
htop
# (Установить: apt install htop -y)
```

### Бэкап базы данных

```bash
# Создать бэкап
docker compose exec postgres pg_dump -U postgres telegram_courses > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
docker compose exec -T postgres psql -U postgres telegram_courses < backup_20250130.sql
```

### Остановка приложения

```bash
# Остановить без удаления данных
docker compose stop

# Остановить и удалить контейнеры (данные в volumes сохранятся)
docker compose down

# Остановить и удалить всё включая данные (ОСТОРОЖНО!)
docker compose down -v
```

---

## 🔧 Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Посмотреть логи
docker compose logs backend

# Проверить статус
docker compose ps

# Пересоздать контейнер
docker compose up -d --force-recreate backend
```

### Проблема: "Cannot connect to database"

```bash
# Проверить что PostgreSQL запущен
docker compose ps postgres

# Посмотреть логи БД
docker compose logs postgres

# Перезапустить БД
docker compose restart postgres
```

### Проблема: "Out of memory"

**Если VPS закончилась память:**
```bash
# Проверить использование памяти
free -h

# Добавить swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Или upgrade VPS в панели Timeweb.

### Проблема: "Connection refused" из Telegram

**Проверьте:**
1. Порты открыты в UFW: `ufw status`
2. Контейнеры запущены: `docker compose ps`
3. URL правильный в @BotFather
4. FRONTEND_URL и VITE_API_URL правильные в .env

### Проблема: SSL сертификат истекает

Let's Encrypt сертификаты обновляются автоматически. Проверка:
```bash
# Тест обновления
certbot renew --dry-run

# Ручное обновление
certbot renew
```

---

## 📊 Checklist полного деплоя

- [ ] VPS создан на Timeweb
- [ ] Подключились по SSH
- [ ] Docker установлен
- [ ] Docker Compose установлен
- [ ] Код клонирован с GitHub
- [ ] .env файл настроен
- [ ] docker-compose up -d выполнен успешно
- [ ] Все 4 контейнера в статусе "Up"
- [ ] Порты открыты в UFW
- [ ] Порты открыты в панели Timeweb
- [ ] Backend доступен: `curl http://IP:3000/health`
- [ ] Frontend открывается в браузере: `http://IP:5173`
- [ ] @BotFather настроен с правильным URL
- [ ] Приложение открывается в Telegram
- [ ] Авторизация работает

### Опционально (для production):
- [ ] Домен куплен и настроен
- [ ] DNS записи добавлены
- [ ] Nginx установлен и настроен
- [ ] SSL сертификат получен
- [ ] HTTPS работает
- [ ] Автообновление SSL настроено

---

## 🎉 Готово!

Ваше приложение теперь работает на собственном VPS!

**URLs:**
- Frontend: `http://ваш-ip:5173` или `https://yoursite.ru`
- Backend API: `http://ваш-ip:3000` или `https://api.yoursite.ru`
- PostgreSQL: localhost:5432 (внутри Docker сети)
- Redis: localhost:6379 (внутри Docker сети)

**Полезные команды:**
```bash
# Статус контейнеров
docker compose ps

# Логи
docker compose logs -f

# Перезапуск
docker compose restart

# Обновление
git pull && docker compose up -d --build

# Бэкап БД
docker compose exec postgres pg_dump -U postgres telegram_courses > backup.sql
```

---

Если возникнут проблемы на любом этапе - дайте знать! Помогу разобраться. 🚀
