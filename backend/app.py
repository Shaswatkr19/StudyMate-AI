from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from google import genai  # ✅ CHANGED
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from ocr_utils import extract_text_with_ocr
from routes.study_routes import router as study_router

# =========================
# ENV + GEMINI CONFIG
# =========================
load_dotenv()

# ✅ NEW WAY
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# =========================
# APP
# =========================
app = FastAPI(title="StudyMate AI API")

app.include_router(study_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    """Extract text from PDF using pypdf"""
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
    """Upload PDF and extract text with OCR fallback"""
    global STUDY_TEXT

    file_bytes = await file.read()
    file.file.seek(0)

    # Normal PDF text extraction
    text = extract_pdf_text(file)

    # OCR fallback if no text found
    if not text.strip():
        print("⚠️ No text found via pypdf, using OCR...")
        text = extract_text_with_ocr(file_bytes)

    if not text.strip():
        return {"error": "No readable text found in PDF"}

    STUDY_TEXT = text

    # ✅ Generate summary with NEW API
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"Explain this chapter in simple teacher style:\n{text[:6000]}"
    )

    return {
        "summary": response.text
    }

# =========================
# CHAT ENDPOINT
# =========================
@app.post("/ask")
async def ask_ai(req: AskRequest):
    """Ask questions about uploaded study material"""
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

    # ✅ NEW WAY
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )

    return {
        "answer": response.text
    }

# =========================
# AUDIO DIALOGUE ENDPOINT
# =========================
@app.post("/audio-dialogue")
async def audio_dialogue():
    """Generate teacher-student dialogue for audio playback"""
    if not STUDY_TEXT:
        return {"error": "No study material uploaded yet"}

    prompt = f"""
Create a 2-minute teacher-student dialogue
based on this content:

{STUDY_TEXT}

Format:
Teacher: [explanation]
Student: [question or comment]
Teacher: [response]
Student: [follow-up]
Teacher: [conclusion]
"""

    # ✅ NEW WAY
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )

    return {
        "dialogue": response.text
    }

# =========================
# STUDY GUIDE ENDPOINT
# =========================
@app.post("/study-guide")
async def study_guide():
    """Generate structured study guide in JSON format"""
    if not STUDY_TEXT.strip():
        return {"error": "No study material available"}

    prompt = f"""
You are a teacher.

From the study material below, create a structured study guide in STRICT JSON format only.

Format:
{{
  "key_concepts": ["concept 1", "concept 2", "concept 3"],
  "summary": "brief summary here",
  "exam_tips": ["tip 1", "tip 2", "tip 3"],
  "practice_questions": ["question 1", "question 2", "question 3"]
}}

Rules:
- Simple language
- Exam-oriented
- No extra text outside JSON
- No markdown code blocks

Study material:
{STUDY_TEXT[:6000]}
"""

    try:
        # ✅ NEW WAY
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return {"error": str(e)}

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
async def root():
    """API health check"""
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