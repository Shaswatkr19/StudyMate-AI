from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs


def extract_video_id(youtube_url: str) -> str:
    """
    Extract video ID from YouTube URL
    Supports:
    - https://www.youtube.com/watch?v=XXXX
    - https://youtu.be/XXXX
    """
    parsed_url = urlparse(youtube_url)

    if "youtube.com" in parsed_url.netloc:
        query = parse_qs(parsed_url.query)
        return query.get("v", [None])[0]

    if "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/")

    return None


def fetch_youtube_transcript(youtube_url: str, max_chars: int = 6000) -> str:
    """
    Fetch transcript text from YouTube video
    """
    video_id = extract_video_id(youtube_url)

    if not video_id:
        raise ValueError("Invalid YouTube URL")

    transcript = YouTubeTranscriptApi.get_transcript(video_id)

    full_text = " ".join([item["text"] for item in transcript])

    # Safety trim (LLM token control)
    return full_text[:max_chars]