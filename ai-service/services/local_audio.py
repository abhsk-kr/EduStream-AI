import os
import subprocess
import json
import math
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

import imageio_ffmpeg

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MAX_FILE_SIZE = 24 * 1024 * 1024  # OpenAI limit is 25MB, we use 24MB to be safe

def get_audio_duration(file_path: str) -> float:
    """Get duration of a media file in seconds using ffprobe."""
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    # ffprobe is typically bundled, or we can use ffmpeg directly
    cmd = [
        exe, "-i", file_path, "-f", "null", "-"
    ]
    # This stderr parsing is a hack since imageio_ffmpeg doesn't expose ffprobe directly
    result = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    for line in result.stderr.split('\\n'):
        if "Duration" in line:
            # Duration: 00:01:23.45, start...
            time_str = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = time_str.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 0.0

def chunk_and_transcribe(input_file: str) -> str:
    """
    Extract audio from a video/audio file, chunk it to fit OpenAI's 25MB limit, 
    and return the fully concatenated transcript.
    """
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # 1. Extract to a low bitrate MP3 to save space (64k is enough for speech)
    base_dir = Path(input_file).parent
    extracted_audio = base_dir / f"{Path(input_file).stem}_extracted.mp3"
    
    # Run ffmpeg to extract audio
    subprocess.run([
        exe, "-i", input_file, 
        "-vn", "-ar", "16000", "-ac", "1", "-b:a", "64k", 
        "-y", str(extracted_audio)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # 2. Check file size
    file_size = os.path.getsize(extracted_audio)
    
    full_transcript = []
    
    # 3. Transcribe directly if small enough
    if file_size <= MAX_FILE_SIZE:
        with open(extracted_audio, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
            full_transcript.append(transcript)
    else:
        # 4. Chunk it otherwise
        # 64k bitrate = 8 KB/s = ~ 480 KB/minute
        # 24MB = ~ 50 minutes. Let's chunk every 30 minutes (1800s) to be completely safe.
        chunk_duration = 1800
        duration = get_audio_duration(str(extracted_audio))
        chunks_count = math.ceil(duration / chunk_duration)
        
        for i in range(chunks_count):
            start_time = i * chunk_duration
            chunk_file = base_dir / f"{extracted_audio.stem}_chunk_{i}.mp3"
            
            # Slice audio using ffmpeg
            subprocess.run([
                exe, "-i", str(extracted_audio),
                "-ss", str(start_time), "-t", str(chunk_duration),
                "-c", "copy", "-y", str(chunk_file)
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            with open(chunk_file, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
                full_transcript.append(transcript)
            
            # Cleanup chunk
            os.remove(chunk_file)
            
    # Cleanup extracted
    if extracted_audio.exists():
        os.remove(extracted_audio)
        
    return " ".join(full_transcript)
