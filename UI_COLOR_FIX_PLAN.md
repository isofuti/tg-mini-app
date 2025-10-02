# 🎨 План исправления UI цветов

## ⚠️ Проблема

**Белый текст на белом фоне** - пользователи не видят контент!

### Причина:
В Telegram Mini Apps используются theme variables, которые меняются в зависимости от темы пользователя (светлая/тёмная).

Сейчас в приложении:
- Фиксированные цвета (`text-gray-900`, `bg-white`) 
- Не адаптируются к Telegram теме
- В тёмной теме Telegram → белый текст на белом фоне

---

## ✅ Решение

Использовать Telegram CSS variables вместо фиксированных Tailwind цветов.

### Telegram Theme Variables:

```css
--tg-theme-bg-color           /* Фон приложения */
--tg-theme-text-color         /* Основной текст */
--tg-theme-hint-color         /* Второстепенный текст */
--tg-theme-link-color         /* Ссылки */
--tg-theme-button-color       /* Фон кнопки */
--tg-theme-button-text-color  /* Текст кнопки */
--tg-theme-secondary-bg-color /* Вторичный фон (карточки) */
```

---

## 📋 Файлы для изменения

### 1. `frontend/src/index.css` ✅
- Убрать конфликтующие стили
- Добавить правильные fallbacks

### 2. `frontend/tailwind.config.js` ✅  
- Добавить Telegram цвета в theme

### 3. `frontend/src/components/Card.tsx` ✅
- Заменить `bg-white` → `bg-[var(--tg-theme-secondary-bg-color)]`

### 4. `frontend/src/pages/HomePage.tsx` ✅
- Заменить `text-gray-900` → `text-[var(--tg-theme-text-color)]`
- Заменить `text-gray-600` → `text-[var(--tg-theme-hint-color)]`

### 5. `frontend/src/pages/CoursePage.tsx` ✅
- Аналогично HomePage

### 6. `frontend/src/pages/LessonPage.tsx` ✅
- Аналогично

### 7. `frontend/src/pages/ProfilePage.tsx`
- Проверить и исправить

### 8. `frontend/src/pages/SurveyPage.tsx`
- Проверить и исправить

### 9. `frontend/src/components/Layout.tsx`
- Проверить фон

### 10. `frontend/src/components/Button.tsx`
- Проверить цвета кнопок

---

## 🔧 Изменения (детально)

### 1. index.css
```css
/* БЫЛО (НЕПРАВИЛЬНО): */
:root {
  color: rgba(255, 255, 255, 0.87);  /* Белый текст */
  background-color: var(--tg-theme-bg-color, #242424);
}

body {
  background-color: var(--tg-theme-bg-color, #ffffff);
  color: var(--tg-theme-text-color, #000000);
}

/* СТАЛО (ПРАВИЛЬНО): */
:root {
  /* Telegram theme variables установлены через SDK */
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: var(--tg-theme-bg-color, #ffffff);
  color: var(--tg-theme-text-color, #000000);
  overflow-x: hidden;
}
```

### 2. tailwind.config.js
```js
// Добавить в theme.extend.colors:
telegram: {
  bg: 'var(--tg-theme-bg-color, #ffffff)',
  text: 'var(--tg-theme-text-color, #000000)',
  hint: 'var(--tg-theme-hint-color, #6c757d)',
  link: 'var(--tg-theme-link-color, #3b82f6)',
  button: 'var(--tg-theme-button-color, #3b82f6)',
  buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
  secondaryBg: 'var(--tg-theme-secondary-bg-color, #f8f9fa)',
},
```

### 3. Card.tsx
```tsx
// БЫЛО:
'bg-white': variant === 'default',
'bg-white border border-gray-200': variant === 'bordered',
'bg-white shadow-md': variant === 'elevated',

// СТАЛО:
'bg-telegram-secondaryBg': variant === 'default',
'bg-telegram-secondaryBg border border-gray-200/20': variant === 'bordered',
'bg-telegram-secondaryBg shadow-md': variant === 'elevated',
```

### 4-6. Pages (HomePage, CoursePage, LessonPage)
```tsx
// БЫЛО:
className="text-2xl font-bold text-gray-900 mb-2"
className="text-gray-600"
className="text-sm text-gray-500"

// СТАЛО:
className="text-2xl font-bold text-telegram-text mb-2"
className="text-telegram-hint"
className="text-sm text-telegram-hint"
```

---

## 🧪 Тестирование

После исправлений проверить:

1. **В браузере (светлая тема):**
   - Открыть https://kursyapp.ru
   - Текст должен быть чёрным на белом фоне
   - Карточки с лёгким серым фоном

2. **В Telegram (светлая тема):**
   - @courceprat_bot → Начать обучение
   - Текст должен быть виден

3. **В Telegram (тёмная тема):**
   - Настройки Telegram → Сменить на тёмную тему
   - Открыть бота
   - Текст должен быть светлым на тёмном фоне

---

## ⚡ Быстрое применение

После PR merge на VPS:

```bash
cd ~/tg-mini-app
git pull origin main
docker compose build frontend --no-cache
docker compose up -d frontend
docker compose logs frontend --tail 50
```

Или если используется production Dockerfile:
```bash
docker compose restart frontend
```

---

## 📊 Приоритет

**🔴 КРИТИЧНО** - без этого приложение непригодно к использованию!

Пользователи буквально не видят контент в определённых темах.
