from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    print(f"✅ API Key found: {api_key[:10]}...")
    print(f"✅ Full length: {len(api_key)} characters")
else:
    print("❌ API Key NOT found!")
    print("❌ Make sure .env file exists in current directory")
