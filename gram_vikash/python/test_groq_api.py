"""
Simple Groq API test – verify connection and basic response
"""

from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL
import sys

if not GROQ_API_KEY:
    print("❌ ERROR: GROQ_API_KEY not set in environment variables")
    sys.exit(1)

print(f"🔧 Testing Groq API...")
print(f"   API Key: {'*' * 10}...{GROQ_API_KEY[-4:]}")
print(f"   Model: {GROQ_MODEL}\n")

try:
    client = Groq(api_key=GROQ_API_KEY)
    print("✅ Groq client initialized successfully\n")
    
    # Test 1: Simple greeting
    print("📝 Test 1: Simple greeting")
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "user", "content": "Say hello to me in one sentence"}
        ],
        temperature=0.7,
        max_tokens=100,
    )
    print(f"✅ Response: {response.choices[0].message.content}\n")
    
    # Test 2: Hindi translation test
    print("📝 Test 2: English to Hindi translation")
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a translator. Translate the following text from English to Hindi. Only output the translated text."
            },
            {"role": "user", "content": "My crop has brown spots"}
        ],
        temperature=0.1,
        max_tokens=200,
    )
    print(f"✅ Response: {response.choices[0].message.content}\n")
    
    # Test 3: Telugu translation test
    print("📝 Test 3: English to Telugu translation")
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a translator. Translate the following text from English to Telugu. Only output the translated text."
            },
            {"role": "user", "content": "Wheat disease management"}
        ],
        temperature=0.1,
        max_tokens=200,
    )
    print(f"✅ Response: {response.choices[0].message.content}\n")
    
    # Test 4: Diagnosis generation
    print("📝 Test 4: Crop diagnosis generation")
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an agricultural expert. Provide a brief diagnosis in 2-3 sentences."
            },
            {
                "role": "user",
                "content": "My rice crop has yellowing leaves and reduced growth"
            }
        ],
        temperature=0.3,
        max_tokens=300,
    )
    print(f"✅ Response: {response.choices[0].message.content}\n")
    
    print("=" * 60)
    print("✅ ALL TESTS PASSED - Groq API is working correctly!")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ ERROR: {type(e).__name__}")
    print(f"   Details: {str(e)}\n")
    sys.exit(1)
