import re
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(youtube_url: str) -> str:
    """Extract the 11-character video ID from various YouTube URL formats."""
    patterns = [
        r"(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be\/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {youtube_url}")


def format_timestamp(seconds: float) -> str:
    """Convert seconds to HH:MM:SS or MM:SS format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def get_transcript(youtube_url: str) -> dict:
    """
    Fetch the transcript for a YouTube video.

    Returns:
        dict with keys:
            - transcript_segments: list of {text, start, duration, timestamp}
            - full_transcript: joined text string
            - video_id: the extracted video ID
    """
    video_id = extract_video_id(youtube_url)

    try:
        # Try fetching transcript (auto-generated or manual)
        transcript_list = YouTubeTranscriptApi.get_transcript(
            video_id, languages=["en", "en-US", "en-GB"]
        )
    except Exception:
        # Fallback: try any available language
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        except Exception as e:
            raise RuntimeError(
                f"Could not fetch transcript for video {video_id}. "
                f"The video may not have subtitles available. Error: {str(e)}"
            )

    # Process segments
    segments = []
    for entry in transcript_list:
        segments.append(
            {
                "text": entry["text"],
                "start": entry["start"],
                "duration": entry["duration"],
                "timestamp": format_timestamp(entry["start"]),
            }
        )

    full_transcript = " ".join(seg["text"] for seg in segments)

    return {
        "transcript_segments": segments,
        "full_transcript": full_transcript,
        "video_id": video_id,
    }
