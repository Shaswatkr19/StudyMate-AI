from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv 
import yt_dlp
from urllib.parse import urlparse, parse_qs

router = APIRouter()

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# =========================
# MODELS
# =========================
class YouTubeRequest(BaseModel):
    youtube_url: str

class TextRequest(BaseModel):
    text: str

# =========================
# URL PARSER
# =========================
def extract_video_id(youtube_url: str) -> str:
    """Extract video ID from YouTube URL"""
    parsed_url = urlparse(youtube_url)
    
    if "youtube.com" in parsed_url.netloc:
        video_id = parse_qs(parsed_url.query).get("v", [None])[0]
        if video_id:
            return video_id
    
    if "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/").split("?")[0]
    
    return None

# =========================
# YOUTUBE SERVICE (yt-dlp method)
# =========================
def fetch_youtube_transcript(youtube_url: str, max_chars: int = 8000) -> dict:
    """Fetch transcript from YouTube using yt-dlp"""
    
    video_id = extract_video_id(youtube_url)
    
    if not video_id:
        return {
            "success": False,
            "error": "Invalid YouTube URL"
        }
    
    try:
        ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en', 'hi', 'en-US'],
            'quiet': True,
            'no_warnings': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            
            # Try to get subtitles
            subtitles = info.get('subtitles', {})
            automatic_captions = info.get('automatic_captions', {})
            
            # Combine both subtitle sources
            all_subs = {**automatic_captions, **subtitles}
            
            # Try English first
            subtitle_text = None
            for lang in ['en', 'en-US', 'en-GB', 'hi']:
                if lang in all_subs:
                    sub_list = all_subs[lang]
                    if sub_list and len(sub_list) > 0:
                        # Get the first available subtitle format
                        sub_url = sub_list[0].get('url')
                        if sub_url:
                            # Download and parse subtitle content
                            import requests
                            from xml.etree import ElementTree
                            
                            response = requests.get(sub_url)
                            if response.status_code == 200:
                                # Parse XML subtitle
                                try:
                                    root = ElementTree.fromstring(response.content)
                                    texts = [elem.text for elem in root.iter() if elem.text]
                                    subtitle_text = " ".join(texts)
                                    break
                                except:
                                    # Try as plain text
                                    subtitle_text = response.text
                                    break
            
            if not subtitle_text or not subtitle_text.strip():
                return {
                    "success": False,
                    "error": "No captions available"
                }
            
            # Clean and limit text
            subtitle_text = " ".join(subtitle_text.split())
            if len(subtitle_text) > max_chars:
                subtitle_text = subtitle_text[:max_chars] + "..."
            
            print(f"✅ Transcript fetched successfully for {video_id}")
            return {
                "success": True,
                "text": subtitle_text
            }
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Transcript fetch failed for {video_id}: {error_msg}")
        
        return {
            "success": False,
            "error": f"Could not fetch transcript: {error_msg}"
        }

# =========================
# AI ANALYSIS
# =========================
def analyze_video_transcript(transcript_text: str) -> str:
    """Analyze YouTube video transcript"""
    prompt = f"""
You are a study assistant analyzing a YouTube lecture.

Provide:
1. Short Overview (2-3 sentences)
2. Key Concepts (bullet points)
3. Important Topics
4. Study Tips

Transcript:
{transcript_text[:4000]}
"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

def analyze_study_text(text: str) -> str:
    """Analyze plain text study material"""
    prompt = f"""
You are a study assistant.

Provide:
1. Overview
2. Key Concepts
3. Exam Tips

Study Material:
{text[:5000]}
"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

# =========================
# ENDPOINTS
# =========================
@router.post("/analyze/youtube")
async def analyze_youtube(payload: YouTubeRequest):
    """Analyze YouTube video"""
    
    result = fetch_youtube_transcript(payload.youtube_url)
    
    if result["success"]:
        try:
            analysis = analyze_video_transcript(result["text"])
            return {
                "status": "success",
                "analysis": analysis
            }
        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            return {
                "status": "error",
                "analysis": f"Transcript fetched but AI analysis failed: {str(e)}"
            }
    
    # Error response
    return {
        "status": "error",
        "analysis": f"""❌ Could not analyze this video.

**Reason:** {result.get('error', 'Unknown error')}

**💡 Suggestions:**
- Try videos with captions enabled
- Check if video is available in your region
- Or upload PDF notes instead!"""
    }

@router.post("/analyze/text")
async def analyze_text(payload: TextRequest):
    """Analyze plain text study material"""
    
    if not payload.text or len(payload.text.strip()) < 50:
        return {
            "status": "error",
            "message": "Text too short (min 50 chars)"
        }
    
    try:
        analysis = analyze_study_text(payload.text)
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI analysis failed: {str(e)}"
        }