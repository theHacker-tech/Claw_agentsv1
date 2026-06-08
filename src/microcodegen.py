import os
import json
import requests
import sys
import time
import re
import shutil

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
    
    CRITICAL INSTRUCTIONS & CONSTRAINTS:
    1. You must output multiple files using the EXACT formatting pattern below for every single file.
    [START_FILE:path/to/filename.ext]
    // file contents go here
    [END_FILE]
    
    2. DO NOT write or leave any incomplete wires, wrong logic, or missing functions. 
    3. Ensure absolute wiring between all logic, functions, event listeners, and calls. NO placeholders like "TODO" or "Implement here". The code must be 100% complete and functional.
    4. All SQL must be idempotent (e.g., use CREATE TABLE IF NOT EXISTS).
    5. Always generate an exhaustive package.json to prevent Vercel deployment crashes.
    6. All paths must be relative to the project root. DO NOT start file paths with a slash (/).
    7. DO NOT wrap the file block markers inside markdown code blocks (no backticks).

    Ensure you generate the Supabase Schema, Telegram Bot logic, Vercel endpoints, and README.md using the Safe Lexicon."""

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

    file_blocks = re.findall(r"\[START_FILE:(.*?)\](.*?)\[END_FILE\]", ai_response_text, re.DOTALL)
    
    if not file_blocks:
        print("Warning: No structured file blocks found. Saving raw output to raw_generation.log")
        with open("raw_generation.log", "w", encoding="utf-8") as log_file:
            log_file.write(ai_response_text)
        sys.exit(0)

    # PROBLEM 1 FIX: The "Dead Wire" Accumulation
    # Wipe the existing workspace cleanly before writing new files to prevent collision
    if os.path.exists(OUTPUT_ROOT):
        print(f"\nClearing previous workspace: '{OUTPUT_ROOT}/'...")
        shutil.rmtree(OUTPUT_ROOT, ignore_errors=True)

    print(f"\nParsing response and writing files to target workspace: '{OUTPUT_ROOT}/'...")
    for relative_path, file_content in file_blocks:
        relative_path = relative_path.strip().lstrip("/\\")
        
        # PROBLEM 2 FIX: The Markdown Regex Trap
        # Strip AI-hallucinated markdown backticks and language identifiers from the code content
        file_content = file_content.strip()
        file_content = re.sub(r'^```[a-zA-Z]*\n', '', file_content)
        file_content = re.sub(r'\n```$', '', file_content)
        
        full_target_path = os.path.join(OUTPUT_ROOT, relative_path)
        
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
