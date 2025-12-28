from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv 
from urllib.parse import urlparse, parse_qs
import requests
import re

router = APIRouter() 

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

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
# YOUTUBE SERVICE - Direct Scraping
# =========================
def fetch_youtube_info(youtube_url: str) -> dict:
    """Get video info directly using Google's timedtext API"""
    
    video_id = extract_video_id(youtube_url)
    
    if not video_id:
        return {
            "success": False,
            "error": "Invalid YouTube URL"
        }
    
    try:
        # Try to get captions from YouTube's timedtext API
        caption_url = f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en"
        
        response = requests.get(caption_url, timeout=10)
        
        if response.status_code == 200 and response.text.strip():
            # Parse XML captions
            import xml.etree.ElementTree as ET
            try:
                root = ET.fromstring(response.text)
                texts = [elem.text for elem in root.findall('.//text') if elem.text]
                
                if texts:
                    transcript = " ".join(texts)
                    transcript = re.sub(r'\s+', ' ', transcript).strip()
                    
                    if len(transcript) > 8000:
                        transcript = transcript[:8000] + "..."
                    
                    print(f"✅ Got captions for {video_id}")
                    return {"success": True, "text": transcript}
            except:
                pass
        
        # If captions not available, get video page and extract description
        page_url = f"https://www.youtube.com/watch?v={video_id}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        page_response = requests.get(page_url, headers=headers, timeout=10)
        
        if page_response.status_code == 200:
            # Extract video title and description from page
            title_match = re.search(r'"title":"([^"]+)"', page_response.text)
            desc_match = re.search(r'"shortDescription":"([^"]+)"', page_response.text)
            
            content = []
            if title_match:
                content.append(f"Title: {title_match.group(1)}")
            if desc_match:
                desc = desc_match.group(1).replace('\\n', ' ')
                content.append(f"Description: {desc}")
            
            if content:
                text = " ".join(content)
                text = re.sub(r'\s+', ' ', text).strip()
                
                print(f"✅ Got video info for {video_id}")
                return {
                    "success": True, 
                    "text": text,
                    "note": "Captions not available, using title and description"
                }
        
        return {
            "success": False,
            "error": "❌ No captions or info available for this video"
        }
        
    except requests.Timeout:
        return {
            "success": False,
            "error": "❌ Request timeout. Try again."
        }
    except Exception as e:
        print(f"❌ Error: {e}")
        return {
            "success": False,
            "error": f"❌ Could not fetch video info: {str(e)}"
        }

# =========================
# AI ANALYSIS
# =========================
def analyze_video_content(content: str, has_captions: bool = True) -> str:
    """Analyze video content"""
    
    if has_captions:
        prompt = f"""
Analyze this YouTube video transcript and provide:

**📚 Overview**
Write 2-3 sentences summarizing the video.

**🔑 Key Topics Covered**
List the main topics discussed (bullet points).

**💡 Important Takeaways**
What should viewers remember?

**📝 Study Recommendations**
How to use this video for learning?

Transcript:
{content[:5000]}
"""
    else:
        prompt = f"""
Based on this video's title and description, provide:

**📚 What This Video Is About**
Brief overview based on available info.

**🔑 Expected Topics**
What topics are likely covered.

**💡 Note**
Mention that full captions aren't available, so this is based on title/description.

**📝 Recommendation**
Suggest watching the video for complete understanding.

Video Info:
{content}
"""
    
    response = model.generate_content(prompt)
    return response.text

def analyze_study_text(text: str) -> str:
    """Analyze plain text"""
    prompt = f"""
Analyze this study material:

**📚 Overview**
Brief summary

**🔑 Key Concepts**
Main points

**🎯 Study Focus**
What to prioritize

Content:
{text[:5000]}
"""
    
    response = model.generate_content(prompt)
    return response.text

# =========================
# ENDPOINTS
# =========================
@router.post("/analyze/youtube")
async def analyze_youtube(payload: YouTubeRequest):
    """Analyze YouTube video"""
    
    result = fetch_youtube_info(payload.youtube_url)
    
    if result["success"]:
        try:
            has_captions = "note" not in result
            analysis = analyze_video_content(result["text"], has_captions)
            
            if not has_captions:
                analysis = f"ℹ️ **Note:** Full captions not available. Analysis based on title and description.\n\n{analysis}"
            
            return {"status": "success", "analysis": analysis}
        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            return {"status": "error", "analysis": f"Got video info but AI analysis failed: {str(e)}"}
    
    return {"status": "error", "analysis": result.get('error', 'Could not fetch video information')}

@router.post("/analyze/text")
async def analyze_text(payload: TextRequest):
    """Analyze text"""
    
    if not payload.text or len(payload.text.strip()) < 50:
        return {"status": "error", "message": "Text too short (minimum 50 characters)"}
    
    try:
        analysis = analyze_study_text(payload.text)
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        return {"status": "error", "message": f"Analysis failed: {str(e)}"}