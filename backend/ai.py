import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def ask_gemini(context, question):
    prompt = f"""
You are a helpful teacher.

STUDY MATERIAL:
{context}

STUDENT QUESTION:
{question}

Answer clearly like a teacher.
"""
    response = model.generate_content(prompt)
    return response.text