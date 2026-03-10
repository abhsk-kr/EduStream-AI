from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from dotenv import load_dotenv

from services.transcript import get_transcript
from services.summarizer import summarize_transcript, generate_quiz
from services.local_audio import chunk_and_transcribe

load_dotenv()

app = FastAPI(
    title="EduStream AI Service",
    description="AI-powered video transcript extraction, summarization, and quiz generation",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request / Response Models ----------

class TranscriptRequest(BaseModel):
    youtube_url: str

class LocalTranscriptRequest(BaseModel):
    file_path: str
    filename: str

class SummarizeRequest(BaseModel):
    transcript: str
    title: str = ""


class QuizRequest(BaseModel):
    transcript: str
    title: str = ""


# ---------- Health Check ----------

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "EduStream AI Service"}


# ---------- Endpoints ----------

@app.post("/extract-transcript")
def extract_transcript(req: TranscriptRequest):
    """
    Extract transcript from a YouTube video URL.
    Returns transcript segments, full text, and basic video info.
    """
    try:
        result = get_transcript(req.youtube_url)

        # Build basic video info from the video ID
        video_id = result["video_id"]
        video_info = {
            "title": f"YouTube Video ({video_id})",
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            "channel": "",
            "duration": "",
        }

        return {
            "transcript": result["full_transcript"],
            "segments": result["transcript_segments"],
            "video_info": video_info,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcript extraction failed: {str(e)}")


@app.post("/extract-local-transcript")
def extract_local_transcript(req: LocalTranscriptRequest):
    """
    Extract transcript from a locally uploaded video/audio file.
    Uses ffmpeg to extract audio and OpenAI Whisper for transcription.
    """
    try:
        if not os.path.exists(req.file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        full_transcript = chunk_and_transcribe(req.file_path)
        
        video_info = {
            "title": req.filename,
            "thumbnail": "",
            "channel": "Local Upload",
            "duration": "60-90+ mins",
        }
        
        # Return segments as a simple list with 1 entry representing the whole block Since whisper text output doesn't give timestamps by default.
        return {
            "transcript": full_transcript,
            "segments": [{"text": full_transcript, "start": 0, "duration": 0, "timestamp": "00:00"}],
            "video_info": video_info,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local transcript extraction failed: {str(e)}")


@app.post("/summarize")
def summarize(req: SummarizeRequest):
    """
    Generate a structured summary from a transcript.
    Returns high-level summary, key takeaways, and structured notes.
    """
    try:
        if not req.transcript or len(req.transcript.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Transcript is too short to summarize",
            )

        result = summarize_transcript(req.transcript, req.title)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@app.post("/generate-quiz")
def gen_quiz(req: QuizRequest):
    """
    Generate a 5-question multiple-choice quiz from a transcript.
    """
    try:
        if not req.transcript or len(req.transcript.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Transcript is too short to generate a quiz",
            )

        result = generate_quiz(req.transcript, req.title)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
