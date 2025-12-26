from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import google.generativeai as genai
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from ocr_utils import extract_text_with_ocr

# =========================
# ENV + GEMINI CONFIG
# =========================
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# =========================
# APP
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
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
    return text[:8000]  # token safe

# =========================
# UPLOAD PDF
# =========================
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global STUDY_TEXT

    # 🔹 Read file bytes once
    file_bytes = await file.read()

    # 🔹 Reset pointer for PdfReader
    file.file.seek(0)

    # 1️⃣ Normal PDF text extraction (existing logic)
    text = extract_pdf_text(file)

    # 2️⃣ OCR fallback (NEW)
    if not text.strip():
        print("⚠️ No text found via pypdf, using OCR...")
        text = extract_text_with_ocr(file_bytes)

    # 3️⃣ Final safety check
    if not text.strip():
        return {"error": "No readable text found in PDF (even OCR failed)"}

    # 4️⃣ Store text for chat / audio / guide
    STUDY_TEXT = text

    # 5️⃣ Summary generation (unchanged)
    response = model.generate_content(
        f"Explain this chapter in simple teacher style:\n{text[:6000]}"
    )

    return {
        "summary": response.text
    }
    

# =========================
# ASK QUESTION
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
# AUDIO DIALOGUE
# =========================
@app.post("/audio-dialogue")
async def audio_dialogue():
    if not STUDY_TEXT:
        return {"error": "No study material uploaded yet"}

    prompt = f"""
Create a 2-minute teacher-student dialogue
based on this content:

{STUDY_TEXT}

Format:
Teacher:
Student:
Teacher:
"""

    response = model.generate_content(prompt)

    return {
        "dialogue": response.text
    }

# =========================
# STUDY GUIDE
# =========================
@app.post("/study-guide")
async def study_guide():
    if not STUDY_TEXT:
        return {"error": "No study material uploaded yet"}

    prompt = f"""
Create a study guide with:
- Key concepts
- Summary
- Exam tips
- Practice questions

Based on:
{STUDY_TEXT}
"""

    response = model.generate_content(prompt)

    return {
        "guide": response.text
    }