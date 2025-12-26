import pytesseract
from pdf2image import convert_from_bytes

def extract_text_with_ocr(file_bytes: bytes) -> str:
    images = convert_from_bytes(file_bytes)
    text = ""

    for img in images:
        text += pytesseract.image_to_string(img)

    return text.strip()