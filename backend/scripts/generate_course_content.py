#!/usr/bin/env python3
import asyncio, json, os, sys, argparse
from typing import List, Dict, Any
from uuid import UUID
import httpx, psycopg2
from psycopg2.extras import RealDictCursor

YANDEX_GPT_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
MODEL_URI = "gpt://b1gfrf14qevnvpm2n196/yandexgpt-lite/latest"

LESSON_PROMPT = """
Ты опытный преподаватель Python. Создай подробный урок:

Тема: {topic_title}
Урок: {lesson_title} (#{lesson_number})

Требования:
- Объем: 500-1000 слов
- Структура: Введение → Теория → Примеры кода → Резюме
- Формат: Markdown с ```python блоками
- Язык: Русский

Верни ТОЛЬКО текст урока.
"""

QUIZ_PROMPT = """
Создай викторину на тему: {topic_title} (урок: {lesson_title})

{num_questions} вопросов с вариантами ответа.

Формат JSON:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "Текст?",
      "type": "single",
      "options": [
        {{"id": "a", "text": "Вариант", "is_correct": true}}
      ],
      "explanation": "Объяснение"
    }}
  ]
}}

Верни ТОЛЬКО JSON.
"""

TEST_PROMPT = """
Создай тест на тему: {topic_title}

{num_questions} вопросов, passing_score: 70%.

Формат JSON (как викторина, но с "points": 10).

Верни ТОЛЬКО JSON.
"""

async def call_yandex_gpt(prompt: str, api_key: str, model_uri: str) -> str:
    headers = {"Authorization": f"Api-Key {api_key}", "Content-Type": "application/json"}
    payload = {
        "modelUri": model_uri,
        "completionOptions": {"stream": False, "temperature": 0.7, "maxTokens": 2000},
        "messages": [{"role": "user", "text": prompt}]
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(YANDEX_GPT_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["result"]["alternatives"][0]["message"]["text"].strip()

async def generate_lesson(topic, lesson_title, num, api_key, model_uri):
    prompt = LESSON_PROMPT.format(topic_title=topic, lesson_title=lesson_title, lesson_number=num)
    print(f"  🔄 Генерация урока '{lesson_title}'...")
    content = await call_yandex_gpt(prompt, api_key, model_uri)
    print(f"  ✅ Урок сгенерирован ({len(content)} символов)")
    return content

async def generate_quiz(topic, lesson, num, api_key, model_uri):
    prompt = QUIZ_PROMPT.format(topic_title=topic, lesson_title=lesson, num_questions=num)
    print(f"  🔄 Генерация викторины...")
    content = await call_yandex_gpt(prompt, api_key, model_uri)
    content = content.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    print(f"  ✅ Викторина сгенерирована")
    return json.loads(content)

async def generate_test(topic, desc, num, api_key, model_uri):
    prompt = TEST_PROMPT.format(topic_title=topic, topic_description=desc, num_questions=num)
    print(f"  🔄 Генерация теста...")
    content = await call_yandex_gpt(prompt, api_key, model_uri)
    content = content.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    print(f"  ✅ Тест сгенерирован")
    return json.loads(content)

def get_db_connection(db_url):
    return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

def get_themes(conn, course_id):
    with conn.cursor() as cur:
        cur.execute("SELECT id, theme_number, title, description FROM themes WHERE course_id = %s ORDER BY theme_number", (str(course_id),))
        return cur.fetchall()

def insert_lesson(conn, theme_id, num, title, content, ltype, quiz_data):
    with conn.cursor() as cur:
        # ИСПРАВЛЕНО: убрали estimated_time_minutes
        cur.execute("""
            INSERT INTO lessons (theme_id, lesson_number, title, content, lesson_type, quiz_data, is_generated)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING id
        """, (str(theme_id), num, title, content, ltype, json.dumps(quiz_data) if quiz_data else None))
        lesson_id = cur.fetchone()['id']
        conn.commit()
        return lesson_id

async def generate_theme(conn, theme, api_key, model_uri):
    tid = theme['id']
    title = theme['title']
    desc = theme['description']
    print(f"\n📚 Тема {theme['theme_number']}: {title}")
    print("=" * 60)
    counter = 1
    for i in range(1, 6):
        ltitle = f"Урок {i}"
        content = await generate_lesson(title, ltitle, i, api_key, model_uri)
        insert_lesson(conn, tid, counter, ltitle, content, 'theory', None)
        print(f"  💾 Урок {counter} сохранен")
        counter += 1
        if i % 2 == 0 and i // 2 <= 2:
            quiz = await generate_quiz(title, ltitle, 2, api_key, model_uri)
            insert_lesson(conn, tid, counter, f"Проверка: {ltitle}", None, 'quiz', quiz)
            print(f"  💾 Викторина {counter} сохранена")
            counter += 1
    test = await generate_test(title, desc, 8, api_key, model_uri)
    insert_lesson(conn, tid, counter, f"Итоговый тест: {title}", None, 'test', test)
    print(f"  💾 Тест сохранен")
    print(f"✅ Тема '{title}' завершена!\n")

async def generate_course(course_id, api_key, model_uri, db_url):
    conn = get_db_connection(db_url)
    try:
        themes = get_themes(conn, course_id)
        if not themes:
            print(f"❌ Курс не найден!")
            return
        print(f"🚀 Начинаю генерацию курса {course_id}")
        print(f"📊 Найдено тем: {len(themes)}")
        print("=" * 60)
        for theme in themes:
            await generate_theme(conn, theme, api_key, model_uri)
        print("=" * 60)
        print("🎉 Генерация завершена!")
    finally:
        conn.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--course-id", required=True)
    parser.add_argument("--yandex-api-key")
    parser.add_argument("--model-uri", default=MODEL_URI)
    parser.add_argument("--db-url", default=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/telegram_courses"))
    args = parser.parse_args()
    api_key = args.yandex_api_key or os.getenv("YANDEX_API_KEY")
    if not api_key:
        print("❌ API key не указан!")
        sys.exit(1)
    asyncio.run(generate_course(UUID(args.course_id), api_key, args.model_uri, args.db_url))

if __name__ == "__main__":
    main()
