#!/usr/bin/env python3
"""
Скрипт автоматической генерации контента курсов с использованием YandexGPT API
"""
import asyncio
import json
import os
import sys
import argparse
from typing import List, Dict, Any
from uuid import UUID
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

YANDEX_GPT_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
MODEL_URI = "gpt://b1gfrf14qevnvpm2n196/yandexgpt-lite/latest"

LESSON_PROMPT_TEMPLATE = """
Ты опытный преподаватель Python. Создай подробный урок на тему:

Тема курса: {topic_title}
Название урока: {lesson_title}
Номер урока в теме: {lesson_number}

Требования:
- Объем: 500-1000 слов
- Структура: Введение → Теория с примерами → Практические примеры кода → Резюме
- Формат: Markdown с заголовками ##, списками, блоками кода ```python
- Стиль: Простой, понятный, для начинающих
- Язык: Русский

Верни ТОЛЬКО текст урока в Markdown формате, без дополнительных комментариев.
"""

QUIZ_PROMPT_TEMPLATE = """
Ты опытный преподаватель Python. Создай короткую викторину для проверки понимания урока.

Тема: {topic_title}
Урок: {lesson_title}

Требования:
- Количество вопросов: {num_questions} (1-3)
- Типы вопросов: single (один правильный) или multiple (несколько правильных)
- Каждый вопрос должен иметь объяснение правильного ответа
- 2-5 вариантов ответа на вопрос

Верни результат СТРОГО в формате JSON:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "Текст вопроса?",
      "type": "single",
      "options": [
        {{"id": "a", "text": "Вариант А", "is_correct": true}},
        {{"id": "b", "text": "Вариант Б", "is_correct": false}}
      ],
      "explanation": "Объяснение правильного ответа"
    }}
  ]
}}

Верни ТОЛЬКО валидный JSON, без markdown обертки.
"""

TEST_PROMPT_TEMPLATE = """
Ты опытный преподаватель Python. Создай итоговый тест для проверки усвоения всей темы.

Тема: {topic_title}
Описание: {topic_description}

Требования:
- Количество вопросов: {num_questions} (5-10)
- Типы: микс single и multiple вопросов
- Баллы: simple вопросы (single) - 10 баллов, сложные (multiple) - 15-20 баллов
- passing_score: 70%
- Объяснения для всех вопросов

Верни результат СТРОГО в формате JSON:
{{
  "passing_score": 70,
  "questions": [
    {{
      "id": "t1",
      "question": "Текст вопроса?",
      "type": "single",
      "options": [
        {{"id": "a", "text": "Вариант", "is_correct": true}}
      ],
      "points": 10,
      "explanation": "Объяснение"
    }}
  ]
}}

Верни ТОЛЬКО валидный JSON, без markdown обертки.
"""

async def call_yandex_gpt(prompt: str, api_key: str, model_uri: str) -> str:
    headers = {
        "Authorization": f"Api-Key {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "modelUri": model_uri,
        "completionOptions": {
            "stream": False,
            "temperature": 0.7,
            "maxTokens": 2000
        },
        "messages": [{"role": "user", "text": prompt}]
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(YANDEX_GPT_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        result = data["result"]["alternatives"][0]["message"]["text"]
        return result.strip()

async def generate_lesson_content(topic_title: str, lesson_title: str, lesson_number: int, api_key: str, model_uri: str) -> str:
    prompt = LESSON_PROMPT_TEMPLATE.format(topic_title=topic_title, lesson_title=lesson_title, lesson_number=lesson_number)
    print(f"  🔄 Генерация урока '{lesson_title}'...")
    content = await call_yandex_gpt(prompt, api_key, model_uri)
    print(f"  ✅ Урок сгенерирован ({len(content)} символов)")
    return content

async def generate_quiz_content(topic_title: str, lesson_title: str, num_questions: int, api_key: str, model_uri: str) -> Dict[str, Any]:
    prompt = QUIZ_PROMPT_TEMPLATE.format(topic_title=topic_title, lesson_title=lesson_title, num_questions=num_questions)
    print(f"  🔄 Генерация викторины ({num_questions} вопросов)...")
    content = await call_yandex_gpt(prompt, api_key, model_uri)
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    quiz_data = json.loads(content.strip())
    print(f"  ✅ Викторина сгенерирована")
    return quiz_data

async def generate_test_content(topic_title: str, topic_description: str, num_questions: int, api_key: str, model_uri: str) -> Dict[str, Any]:
    prompt = TEST_PROMPT_TEMPLATE.format(topic_title=topic_title, topic_description=topic_description, num_questions=num_questions)
    print(f"  🔄 Генерация теста ({num_questions} вопросов)...")
    content = await call_yandex_gpt(prompt, api_key, model_uri)
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    test_data = json.loads(content.strip())
    print(f"  ✅ Тест сгенерирован")
    return test_data

def get_db_connection(db_url: str):
    return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

def get_course_topics(conn, course_id: UUID) -> List[Dict]:
    with conn.cursor() as cur:
        cur.execute("SELECT id, theme_number, title, description FROM themes WHERE course_id = %s ORDER BY theme_number", (str(course_id),))
        return cur.fetchall()

def insert_lesson(conn, theme_id: UUID, lesson_number: int, title: str, content: str, lesson_type: str, quiz_data: Dict = None, estimated_minutes: int = 15):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO lessons (theme_id, lesson_number, title, content, lesson_type, quiz_data, is_generated, estimated_time_minutes)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE, %s)
            RETURNING id
        """, (str(theme_id), lesson_number, title, content, lesson_type, json.dumps(quiz_data) if quiz_data else None, estimated_minutes))
        lesson_id = cur.fetchone()['id']
        conn.commit()
        return lesson_id

async def generate_topic_content(conn, topic: Dict, api_key: str, model_uri: str, num_lessons: int = 5, num_quizzes: int = 2, num_test_questions: int = 8):
    theme_id = topic['id']
    topic_title = topic['title']
    topic_description = topic['description']
    print(f"\n📚 Тема {topic['theme_number']}: {topic_title}")
    print("=" * 60)
    lesson_counter = 1
    for i in range(1, num_lessons + 1):
        lesson_title = f"Урок {i}"
        content = await generate_lesson_content(topic_title, lesson_title, i, api_key, model_uri)
        insert_lesson(conn, theme_id, lesson_counter, lesson_title, content, 'theory', None, 15)
        print(f"  💾 Урок {lesson_counter} сохранен в БД")
        lesson_counter += 1
        if i % 2 == 0 and (i // 2) <= num_quizzes:
            quiz_data = await generate_quiz_content(topic_title, lesson_title, 2, api_key, model_uri)
            quiz_title = f"Проверка: {lesson_title}"
            insert_lesson(conn, theme_id, lesson_counter, quiz_title, None, 'quiz', quiz_data, 3)
            print(f"  💾 Викторина {lesson_counter} сохранена в БД")
            lesson_counter += 1
    test_data = await generate_test_content(topic_title, topic_description, num_test_questions, api_key, model_uri)
    test_title = f"Итоговый тест: {topic_title}"
    insert_lesson(conn, theme_id, lesson_counter, test_title, None, 'test', test_data, 15)
    print(f"  💾 Итоговый тест сохранен в БД")
    print(f"✅ Тема '{topic_title}' завершена!\n")

async def generate_course(course_id: UUID, api_key: str, model_uri: str, db_url: str):
    conn = get_db_connection(db_url)
    try:
        topics = get_course_topics(conn, course_id)
        if not topics:
            print(f"❌ Курс {course_id} не найден или не содержит тем!")
            return
        print(f"🚀 Начинаю генерацию курса {course_id}")
        print(f"📊 Найдено тем: {len(topics)}")
        print("=" * 60)
        for topic in topics:
            await generate_topic_content(conn, topic, api_key, model_uri, num_lessons=5, num_quizzes=2, num_test_questions=8)
        print("=" * 60)
        print("🎉 Генерация курса завершена!")
        print(f"✅ Обработано тем: {len(topics)}")
    finally:
        conn.close()

def main():
    parser = argparse.ArgumentParser(description="Генерация контента курсов через YandexGPT")
    parser.add_argument("--course-id", required=True, help="UUID курса в БД")
    parser.add_argument("--yandex-api-key", help="YandexGPT API ключ (или через env YANDEX_API_KEY)")
    parser.add_argument("--model-uri", default=MODEL_URI, help="YandexGPT Model URI")
    parser.add_argument("--db-url", default=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/telegram_courses"), help="PostgreSQL connection string")
    args = parser.parse_args()
    api_key = args.yandex_api_key or os.getenv("YANDEX_API_KEY")
    if not api_key:
        print("❌ Ошибка: YandexGPT API key не указан!")
        print("Используйте --yandex-api-key или установите YANDEX_API_KEY")
        sys.exit(1)
    asyncio.run(generate_course(UUID(args.course_id), api_key, args.model_uri, args.db_url))

if __name__ == "__main__":
    main()
