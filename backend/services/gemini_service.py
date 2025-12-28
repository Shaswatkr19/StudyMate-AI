import google.generativeai as genai
import os


# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_video_transcript(transcript_text: str) -> str:
    """
    Analyze YouTube video transcript using Gemini AI
    
    Args:
        transcript_text: Full transcript text
        
    Returns:
        Analysis text from AI
        
    Raises:
        Exception: If AI generation fails
    """
    prompt = f"""
You are a study assistant analyzing a YouTube lecture.

Provide:
1. Short Overview (2-3 sentences)
2. Key Concepts (bullet points)
3. Important Topics
4. Study Tips

Transcript:
{transcript_text}
"""
    
    response = model.generate_content(prompt)
    return response.text


def analyze_study_text(text: str) -> str:
    """
    Analyze plain text study material using Gemini AI
    
    Args:
        text: Study material text
        
    Returns:
        Analysis text from AI
        
    Raises:
        Exception: If AI generation fails
    """
    prompt = f"""
You are a study assistant.

Provide:
1. Overview
2. Key Concepts
3. Exam Tips

Study Material:
{text[:5000]}
"""
    
    response = model.generate_content(prompt)
    return response.text