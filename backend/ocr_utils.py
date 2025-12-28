try:
    import pytesseract
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except Exception as e:
    OCR_AVAILABLE = False
    print("⚠️ OCR disabled:", e)

def extract_text_with_ocr(file_bytes: bytes) -> str:
    """
    OCR extraction with safe fallback.
    Will NOT crash on Render.
    """

    if not OCR_AVAILABLE:
        return ""

    try:
        images = convert_from_bytes(file_bytes)
        text = ""

        for img in images:
            text += pytesseract.image_to_string(img)

        return text.strip()

    except Exception as e:
        print("⚠️ OCR failed:", e)
        return ""