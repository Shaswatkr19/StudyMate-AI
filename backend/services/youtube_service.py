from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from utils.url_parser import extract_video_id


def fetch_youtube_transcript(youtube_url: str, max_chars: int = 8000) -> dict:
    """
    Fetch transcript from YouTube video
    
    Args:
        youtube_url: Full YouTube URL
        max_chars: Maximum characters to return
        
    Returns:
        dict with keys:
        - success: bool
        - text: str (if success)
        - error: str (if failed)
    """
    video_id = extract_video_id(youtube_url)
    
    if not video_id:
        return {
            "success": False,
            "error": "Invalid YouTube URL. Please provide a valid YouTube video link."
        }
    
    try:
        # Try to get transcript - first attempt with common languages
        try:
            transcript_data = YouTubeTranscriptApi.get_transcript(
                video_id,
                languages=['en', 'en-US', 'en-GB', 'hi', 'en-IN']
            )
        except NoTranscriptFound:
            # Try to get any available transcript
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Get first available transcript
            available = list(transcript_list)
            if not available:
                raise NoTranscriptFound("No transcripts available")
            
            transcript = available[0]
            transcript_data = transcript.fetch()
        
        # Combine all text segments
        text = " ".join(item["text"] for item in transcript_data)
        
        # Clean up text
        text = " ".join(text.split())
        
        # Limit text length
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        if not text.strip():
            return {
                "success": False,
                "error": "Transcript is empty or contains no readable text."
            }
        
        return {
            "success": True,
            "text": text
        }
        
    except TranscriptsDisabled:
        return {
            "success": False,
            "error": "❌ This video has disabled captions/subtitles.\n\n💡 Try videos from: Khan Academy, CrashCourse, TED-Ed, 3Blue1Brown"
        }
    
    except NoTranscriptFound:
        return {
            "success": False,
            "error": "❌ No captions available for this video.\n\n💡 The creator may not have added subtitles."
        }
    
    except VideoUnavailable:
        return {
            "success": False,
            "error": "❌ This video is unavailable, private, or restricted."
        }
    
    except Exception as e:
        error_msg = str(e).lower()
        
        # Handle XML parsing errors
        if "no element found" in error_msg or "xml" in error_msg:
            return {
                "success": False,
                "error": "❌ Unable to fetch video captions. Video might be region-blocked or have no captions."
            }
        
        return {
            "success": False,
            "error": f"❌ Error: {str(e)}"
        }
