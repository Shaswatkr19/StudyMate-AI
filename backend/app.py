from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import google.generativeai as genai
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from ocr_utils import extract_text_with_ocr
from routes.study_routes import router as study_router

# =========================
# ENV + GEMINI CONFIG
# =========================
load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# =========================
# APP
# =========================
app = FastAPI(title="StudyMate AI API")

app.include_router(study_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://studymate-ai-shaswat.netlify.app/",  
        "http://localhost:5173",
        "http://localhost:3000",
        "*" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# TEMP MEMORY (MVP)
# =========================
STUDY_TEXT = ""

# =========================
# MODELS
# =========================
class AskRequest(BaseModel):
    question: str

# =========================
# UTILS
# =========================
def extract_pdf_text(file: UploadFile) -> str:
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted
    return text[:8000]

# =========================
# UPLOAD PDF ENDPOINT
# =========================
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global STUDY_TEXT

    file_bytes = await file.read()
    file.file.seek(0)

    text = extract_pdf_text(file)

    if not text.strip():
        print("⚠️ Using OCR fallback")
        text = extract_text_with_ocr(file_bytes)

    if not text.strip():
        return {"error": "No readable text found in PDF"}

    STUDY_TEXT = text

    prompt = f"""
Explain this chapter in simple teacher style:

{text[:6000]}
"""

    response = model.generate_content(prompt)

    return {
        "summary": response.text
    }

# =========================
# CHAT ENDPOINT
# =========================
@app.post("/ask")
async def ask_ai(req: AskRequest):
    if not STUDY_TEXT:
        return {"error": "No study material uploaded yet"}

    prompt = f"""
You are a helpful teacher.

Study material:
{STUDY_TEXT}

Student question:
{req.question}

Explain clearly with examples.
"""

    response = model.generate_content(prompt)

    return {
        "answer": response.text
    }

# =========================
# AUDIO DIALOGUE ENDPOINT
# =========================
@app.post("/audio-dialogue")
async def audio_dialogue():
    if not STUDY_TEXT:
        return {"error": "No study material uploaded yet"}

    prompt = f"""
Create a 2-minute teacher-student dialogue.

Format:
Teacher: explanation
Student: question
Teacher: response
Student: follow-up
Teacher: conclusion

Content:
{STUDY_TEXT[:5000]}
"""

    response = model.generate_content(prompt)

    return {
        "dialogue": response.text
    }

# =========================
# STUDY GUIDE ENDPOINT
# =========================
@app.post("/study-guide")
async def study_guide():
    if not STUDY_TEXT.strip():
        return {"error": "No study material available"}

    prompt = f"""
Create a STRICT JSON study guide.

Format ONLY JSON:
{{
  "key_concepts": ["concept 1", "concept 2"],
  "summary": "short summary",
  "exam_tips": ["tip 1", "tip 2"],
  "practice_questions": ["q1", "q2"]
}}

Rules:
- No markdown
- No explanation text

Study material:
{STUDY_TEXT[:6000]}
"""

    response = model.generate_content(prompt)
    return response.text

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
async def root():
    return {
        "status": "running",
        "message": "StudyMate AI Backend",
        "endpoints": {
            "upload": "/upload-pdf",
            "chat": "/ask",
            "audio": "/audio-dialogue",
            "guide": "/study-guide",
            "youtube": "/api/analyze/youtube",
            "text": "/api/analyze/text"
        }
    }