import os
import json
import requests
import sys
import time
import re

# Configuration
API_KEY = os.environ.get("OPENROUTER_API_KEY")
MODEL = "openrouter/free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Dedicated output directory for your generated project files
OUTPUT_ROOT = "hybrid_vault_workspace"

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

def generate_and_build_codebase(prd_text):
    if not API_KEY:
        print("Error: OPENROUTER_API_KEY environment variable is missing in GitHub Secrets.")
        sys.exit(1)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "HTTP-Referer": "https://github.com/theHacker-tech", 
        "X-Title": "Autonomous Codebase Generator",
        "Content-Type": "application/json"
    }

    system_prompt = f"""You are an elite Autonomous Software Engineer.
    Read the provided Product Requirements Document (PRD).
    Your task is to generate the complete, production-ready codebase files matching these requirements.
    
    You must output multiple files using the EXACT formatting pattern below for every single file. Do not wrap the file block markers inside extra markdown code blocks.
    
    [START_FILE:path/to/filename.ext]
    // file contents go here
    [END_FILE]
    
    Ensure you generate:
    1. The Supabase Database Schema and RLS Policies (e.g., supabase/schema.sql)
    2. The Telegram Bot service logic using the safe lexicon terms.
    3. The Vercel serverless functions/endpoints handling token generation and async payment states.
    4. A concise README.md for the generated project.
    
    All paths must be relative to the project root. DO NOT start file paths with a slash (/). Do not include introductory text or conversational filler; output only the file blocks."""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the PRD:\n\n{prd_text}"}
        ]
    }

    MAX_ATTEMPTS = 5
    ai_response_text = ""
    
    for attempt in range(MAX_ATTEMPTS):
        print(f"Contacting OpenRouter API (Attempt {attempt + 1}/{MAX_ATTEMPTS})...")
        response = requests.post(API_URL, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            ai_response_text = response.json()['choices'][0]['message']['content']
            break
        elif response.status_code == 429:
            print("Rate limit hit. Pausing for 30 seconds before retry...")
            time.sleep(30)
        else:
            print(f"API Error: {response.status_code} - {response.text}")
            sys.exit(1)
            
    if not ai_response_text:
        print(f"Failed to get response from OpenRouter after {MAX_ATTEMPTS} attempts.")
        sys.exit(1)

    # Parsing engine to split response into physical files and directories
    file_blocks = re.findall(r"\[START_FILE:(.*?)\](.*?)\[END_FILE\]", ai_response_text, re.DOTALL)
    
    if not file_blocks:
        print("Warning: No structured file blocks found. Saving raw output to raw_generation.log")
        with open("raw_generation.log", "w", encoding="utf-8") as log_file:
            log_file.write(ai_response_text)
        sys.exit(0)

    print(f"\nParsing response and writing files to target workspace: '{OUTPUT_ROOT}/'...")
    for relative_path, file_content in file_blocks:
        # STRIP LEADING SLASHES to prevent writing to absolute root directories
        relative_path = relative_path.strip().lstrip("/\\")
        file_content = file_content.strip()
        
        # Build the full absolute path inside our dedicated project folder
        full_target_path = os.path.join(OUTPUT_ROOT, relative_path)
        
        # Create directories if they do not exist
        parent_dir = os.path.dirname(full_target_path)
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)
            
        with open(full_target_path, "w", encoding="utf-8") as target_file:
            target_file.write(file_content)
            print(f"  -> Created file: {full_target_path}")

    print(f"\nSuccess! All core components deployed to standard workspace directories.")

if __name__ == "__main__":
    prd = read_prd()
    generate_and_build_codebase(prd)
