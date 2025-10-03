# 🔄 Руководство по регенерации контента

## Общая концепция

После покупки курса пользователь получает **5 попыток регенерации** контента. Это позволяет улучшить качество материалов, если пользователя не устроил AI-генерированный контент.

## Типы регенерации

### 1. Регенерация всего курса
- Перегенерирует все уроки во всех темах
- Использует 1 попытку
- Курс переходит в состояние `generating`

### 2. Регенерация темы
- Перегенерирует все уроки в выбранной теме
- Использует 1 попытку
- Сохраняет контент других тем

### 3. Регенерация урока
- Перегенерирует конкретный урок
- Использует 1 попытку
- Самый экономный способ

## API Endpoints

### Получить информацию о регенерации

```http
GET /api/regeneration/course/:courseId/info
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "regenerations_remaining": 5,
  "last_regeneration_at": "2025-10-03T10:00:00Z"
}
```

### Регенерировать весь курс

```http
POST /api/regeneration/course/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Контент не подходит по уровню сложности"
}
```

**Ответ:**
```json
{
  "message": "Course regeneration started",
  "regenerations_remaining": 4
}
```

### Регенерировать тему

```http
POST /api/regeneration/theme/:themeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Нужно больше практических примеров"
}
```

**Ответ:**
```json
{
  "message": "Theme regeneration started",
  "regenerations_remaining": 4
}
```

### Регенерировать урок

```http
POST /api/regeneration/lesson/:lessonId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Материал слишком сложный"
}
```

**Ответ:**
```json
{
  "message": "Lesson regenerated successfully",
  "regenerations_remaining": 4,
  "content": "# Новый контент урока..."
}
```

## Ошибки

### Нет доступных регенераций

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "No regenerations remaining",
  "regenerations_remaining": 0
}
```

### Курс не найден

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Course not found"
}
```

### Нет доступа

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "Access denied"
}
```

## База данных

### Таблица regeneration_history

Все регенерации логируются для аналитики:

```sql
CREATE TABLE regeneration_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  lesson_id UUID REFERENCES lessons(id),
  theme_id UUID REFERENCES themes(id),
  regeneration_type VARCHAR(50), -- 'course', 'theme', 'lesson'
  reason TEXT,
  created_at TIMESTAMP
);
```

### Поля в таблицах

**courses:**
- `regenerations_remaining INT` - оставшиеся попытки (по умолчанию 5)
- `last_regeneration_at TIMESTAMP` - дата последней регенерации

**lessons:**
- `regenerations_count INT` - сколько раз регенерировался
- `last_regeneration_at TIMESTAMP` - когда последний раз

**themes:**
- `regenerations_count INT` - сколько раз регенерировалась
- `last_regeneration_at TIMESTAMP` - когда последний раз

## Frontend интеграция

### Показать кнопки регенерации

```tsx
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

function CoursePage({ courseId }) {
  const [regenerationsLeft, setRegenerationsLeft] = useState(5);

  useEffect(() => {
    api.get(`/regeneration/course/${courseId}/info`)
      .then(res => setRegenerationsLeft(res.data.regenerations_remaining));
  }, [courseId]);

  const handleRegenerateLesson = async (lessonId) => {
    try {
      const result = await api.post(`/regeneration/lesson/${lessonId}`, {
        reason: 'User requested improvement'
      });
      setRegenerationsLeft(result.data.regenerations_remaining);
      alert('Урок перегенерирован!');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка регенерации');
    }
  };

  return (
    <div>
      <p>Осталось попыток: {regenerationsLeft}/5</p>
      <button onClick={() => handleRegenerateLesson(lessonId)}>
        🔄 Перегенерировать урок
      </button>
    </div>
  );
}
```

## Best practices

### 1. Показывайте оставшиеся попытки
Пользователь должен видеть сколько попыток осталось ПЕРЕД регенерацией

### 2. Спрашивайте причину
Соберите feedback через модальное окно:
- Слишком сложно
- Слишком просто
- Не хватает примеров
- Другое (свой текст)

### 3. Предупреждайте о последствиях
"Регенерация заменит текущий контент. Продолжить?"

### 4. Дебаунс кнопок
Предотвращайте случайные множественные клики

### 5. Показывайте прогресс
При регенерации курса/темы показывайте индикатор загрузки

## Мониторинг и аналитика

### Запросы для аналитики

```sql
-- Самые частые причины регенерации
SELECT reason, COUNT(*) as count
FROM regeneration_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY reason
ORDER BY count DESC;

-- Пользователи, которые используют все попытки
SELECT u.telegram_id, u.username, COUNT(*) as regenerations
FROM regeneration_history rh
JOIN users u ON u.id = rh.user_id
GROUP BY u.id
HAVING COUNT(*) >= 5;

-- Уроки, которые чаще всего регенерируют
SELECT l.title, COUNT(*) as count
FROM regeneration_history rh
JOIN lessons l ON l.id = rh.lesson_id
GROUP BY l.id
ORDER BY count DESC
LIMIT 10;
```

## Будущие улучшения

- [ ] Дополнительные попытки за звезды (платно)
- [ ] Откат к предыдущей версии урока
- [ ] История изменений контента
- [ ] A/B тестирование разных версий уроков
- [ ] Автоматическая регенерация при низких оценках
