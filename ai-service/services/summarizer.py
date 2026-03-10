import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")


def summarize_transcript(transcript: str, title: str = "") -> dict:
    """
    Use OpenAI GPT-4o to generate a structured summary from a video transcript.

    Returns:
        dict with keys:
            - high_level_summary: str — "The Big Picture"
            - key_takeaways: list[str] — bullet points
            - structured_notes: list[dict] — {timestamp, title, content}
    """

    system_prompt = """You are an expert educational content analyst. 
Your job is to transform video transcripts into clear, structured learning materials.
Always respond with valid JSON only — no additional text or markdown."""

    user_prompt = f"""Analyze the following video transcript and generate structured learning notes.

Video Title: {title}

Transcript:
\"\"\"
{transcript[:300000]}
\"\"\"

Return a JSON object with exactly this structure:
{{
  "high_level_summary": "A 2-3 paragraph overview that captures the main theme, purpose, and key message of the video. Write it as 'The Big Picture' — something a student can read to understand what the video is about without watching it.",
  "key_takeaways": [
    "Takeaway 1 — a concise, actionable bullet point",
    "Takeaway 2 — ...",
    "Takeaway 3 — ...",
    "Takeaway 4 — ...",
    "Takeaway 5 — ..."
  ],
  "structured_notes": [
    {{
      "timestamp": "00:00",
      "title": "Introduction / Chapter Title",
      "content": "A highly detailed, comprehensive, and elaborated explanation of the chapter's contents. Should be multiple sentences long, diving deep into the specifics, concepts, and examples."
    }},
    {{
      "timestamp": "05:30",
      "title": "Next major topic",
      "content": "Detailed notes..."
    }}
  ]
}}

Guidelines:
- Provide a "high_level_summary" (1-2 paragraphs).
- List 3-5 "key_takeaways".
- Provide structured "structured_notes" broken down chronologically. 
CRITICAL: For each chapter in the structured_notes, provide a HIGHLY DETAILED, elaborated, and comprehensive explanation of the concepts discussed. Do not use brief sentences; instead, thoroughly explain the ideas, examples, and context like a detailed textbook.
- Use approximate timestamps based on content flow
- Write in clear, educational language suitable for students
- Include specific examples, numbers, or definitions mentioned in the transcript"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)
    return result


def generate_quiz(transcript: str, title: str = "") -> dict:
    """
    Use OpenAI GPT-4o to generate a 5-question multiple choice quiz from the transcript.

    Returns:
        dict with key:
            - questions: list of {question, options, correctAnswer, explanation}
    """

    system_prompt = """You are an expert quiz creator for educational content.
Generate challenging but fair multiple-choice questions that test understanding, not just memorization.
Always respond with valid JSON only."""

    user_prompt = f"""Based on the following video transcript, create a 5-question multiple-choice quiz.

Video Title: {title}

Transcript:
\"\"\"
{transcript[:300000]}
\"\"\"

Return a JSON object with exactly this structure:
{{
  "questions": [
    {{
      "question": "What is the main concept discussed in the video regarding...?",
      "options": [
        "Option A — the correct answer text",
        "Option B — a plausible distractor",
        "Option C — another plausible distractor",
        "Option D — another plausible distractor"
      ],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct and what the video explained about this topic."
    }}
  ]
}}

Guidelines:
- Create exactly 5 questions
- Each question must have exactly 4 options
- correctAnswer is a 0-based index (0, 1, 2, or 3)
- Mix question types: factual recall, conceptual understanding, and application
- Make distractors plausible but clearly wrong when you know the material
- Explanations should reference what was actually said in the transcript"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.5,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)
    return result
