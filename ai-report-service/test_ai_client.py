#!/usr/bin/env python3
"""Simple test script for AI client with structured output"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.ai_client import AIClient
from app.models.structured_outputs import SimpleListOutput

def test_ai_client():
    """Test AI client with a simple structured output call"""
    print("Testing AI Client...")
    print(f"Provider: {os.getenv('AI_MODEL_PROVIDER', 'openai')}")
    print(f"Model: {os.getenv('AI_MODEL_NAME', 'gpt-3.5-turbo')}")
    print("-" * 50)
    
    try:
        # Initialize AI client
        client = AIClient()
        
        # Simple prompt for structured output
        prompt = "List 3 important skills for students to develop."
        
        print(f"Prompt: {prompt}")
        print("-" * 50)
        
        # Generate structured content
        result = client.generate_structured_content(
            prompt=prompt,
            response_model=SimpleListOutput,
            max_tokens=200
        )
        
        # Print results
        print("✅ Success! Structured Output:")
        print(f"Items: {result.items}")
        print("-" * 50)
        print("✅ AI Client is working correctly!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_ai_client()

