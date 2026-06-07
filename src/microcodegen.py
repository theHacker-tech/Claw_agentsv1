import os
import json
import requests
import sys
import time

# Configuration
API_KEY = os.environ.get("OPENROUTER_API_KEY")
# Using the OpenRouter auto-router to dynamically pick available free models
MODEL = "openrouter/free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

def read_prd():
    try:
        with open("PRD.md", "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                print("PRD.md is empty. Please add requirements.")
                sys.exit(0)
            return content
    except FileNotFoundError:
        print("Error: PRD.md not found.")
        sys.exit(1)

def generate_code(prd_text):
    if not API_KEY:
        print("Error: OPENROUTER_API_KEY environment variable is missing in GitHub Secrets.")
        sys.exit(1)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "HTTP-Referer": "https://github.com/theHacker-tech", 
        "X-Title": "Autonomous PRD Pipeline",
        "Content-Type": "application/json"
    }

    system_prompt = """You are an elite Autonomous Software Architect.
    Read the provided Product Requirements Document (PRD). 
    Your task is to output a comprehensive technical blueprint containing:
    1. A Mermaid.js system architecture diagram.
    2. A complete project folder structure.
    3. The core backend scaffolding code (scripts and endpoints).
    Format your entire response in clear Markdown."""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the PRD:\n\n{prd_text}"}
        ]
    }

    # Increased to 5 attempts to survive heavy traffic spikes
    MAX_ATTEMPTS = 5
    for attempt in range(MAX_ATTEMPTS):
        print(f"Contacting OpenRouter API (Attempt {attempt + 1}/{MAX_ATTEMPTS})...")
        response = requests.post(API_URL, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        elif response.status_code == 429:
            # Increased wait time to 30 seconds to let the queue clear
            print("Rate limit hit. Pausing for 30 seconds before retry...")
            time.sleep(30)
        else:
            print(f"API Error: {response.status_code} - {response.text}")
            sys.exit(1)
            
    print(f"Failed to get response from OpenRouter after {MAX_ATTEMPTS} attempts.")
    sys.exit(1)

if __name__ == "__main__":
    prd = read_prd()
    result = generate_code(prd)
    
    # Save the AI's output to a new file
    output_filename = "GENERATED_ARCHITECTURE.md"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(result)
    
    print(f"Success: Generated architecture saved to {output_filename}")
