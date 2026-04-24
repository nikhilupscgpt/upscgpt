import json
import requests
import os
from datetime import datetime

# Processing Engine (Local Factory)
# Pre-requisites: pip install ollama, requests

# This script assumes Gemma 4 2B (Gater) and Gemma 4 26B (Reasoning) are available via Ollama local host.
OLLAMA_URL = "http://localhost:11434/api/chat"
SYNC_URL = "http://localhost:3000/api/news/sync"
ENGINE_TOKEN = "upscgpt_gemma_engine_2026_topsecret" # Match .env

def query_gemma(prompt, model="gemma4:2b", format="json"):
    """
    Query the local Gemma 4 model via Ollama.
    """
    try:
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "format": "json",
            "stream": False
        }
        res = requests.post(url, json=payload)
        res.raise_for_status()
        return json.loads(res.json()["response"])
    except Exception as e:
        print(f"[Process] Local AI Error ({model}):", e)
        return None

def process_news(articles):
    processed_articles = []
    
    for article in articles:
        print(f"[Process] Gating: {article['title']}")
        
        # Layer 2: The Gemma Gater (Filtering)
        gater_prompt = f"""
        Task: UPSC Relevance Filter
        Article Title: {article['title']}
        First Paragraph: {article['content'][:300]}
        
        Logic: Is this relevant to UPSC Syllabus (GS 1, 2, 3, 4)?
        Return JSON: {{"is_relevant": true/false, "relevance_score": 0-10}}
        """
        gate_result = query_gemma(gater_prompt, model="gemma4:2b")
        
        if not gate_result or not gate_result.get("is_relevant"):
            print(f"[Process] Discarded: Non-UPSC.")
            continue
            
        print(f"[Process] Reasoning: {article['title']}")
        
        # Layer 3: The Reasoning Brain (Gemma 4 26B)
        reasoning_prompt = f"""
        Task: Elite UPSC Strategic Analysis
        Article Title: {article['title']}
        Full Content: {article['content']}
        
        Instruction: Analyze the provided article as a senior UPSC evaluator. 
        1. CRITICAL: Do NOT mention "RBI", "Repo Rate", "Article 324", or "Election Commission" unless they are the primary subject of THIS specific article.
        2. Identify any GEOGRAPHIC LOCATIONS (Cities, Rivers, Borders, Regions) mentioned.
        3. Synthesize the "Crux" for Mains (GS 1-4 context).
        4. Extract a "Prelims Fact" and a "Mains Inquiry".
        
        Output JSON Format:
        {{
          "category": "Economy|IR|Polity|Environment|Security|Science",
          "relevance": {gate_result['relevance_score']},
          "summary": "1-sentence executive summary",
          "editorials": [
            {{
              "issue": "The core thematic challenge",
              "crux": "Deep analytical synthesis (150-200 words)",
              "perspectives": {{"government": ["..."], "critics": ["..."], "way_forward": ["..."]}},
              "gsPaper": "GS1|GS2|GS3|GS4",
              "keywords": "5 high-value UPSC keywords"
            }}
          ],
          "facts": [
            {{
              "type": "PRELIMS_FACT",
              "content": "A high-yield factual data point from the text",
              "category": "Geography|Economy|Polity",
              "locationName": "The EXACT name of the location for mapping (if any)",
              "mcq": {{
                "question": "A conceptual UPSC-style MCQ testing this fact",
                "options": ["A...", "B...", "C...", "D..."],
                "answer": "Exact text of correct option",
                "explanation": "Why this option is correct based ONLY on the text"
              }}
            }},
            {{
              "type": "MAINS_FACT",
              "content": "A significant argument or structural data point",
              "category": "Geography|Economy|Polity",
              "locationName": "Location name if relevant",
              "mainsQuestion": "An analytical question for GS Mains based on this article's developments"
            }}
          ]
        }}
        """
        analysis = query_gemma(reasoning_prompt, model="gemma4:26b")
        
        if analysis:
            article.update(analysis)
            processed_articles.append(article)
            print(f"[Process] Successfully analyzed: {article['title']}")

    return processed_articles

def sync_to_portal(articles):
    print(f"[Sync] Pushing {len(articles)} analyzed articles to UPSCGPT Portal...")
    try:
        headers = {"Authorization": f"Bearer {ENGINE_TOKEN}"}
        payload = {"articles": articles}
        res = requests.post(SYNC_URL, json=payload, headers=headers)
        res.raise_for_status()
        print("[Sync] Portal update successful.")
        return res.json()
    except Exception as e:
        print("[Sync] Portal update failed:", e)
        return None

def run_engine():
    # Load most recent ingestion
    data_dir = "scripts/news_engine/data"
    raw_files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.startswith("raw_")]
    if not raw_files:
        print("[Process] No raw news found to process.")
        return
        
    latest_file = max(raw_files, key=os.path.getctime)
    with open(latest_file, "r") as f:
        articles = json.load(f)
        
    print(f"[Process] Analyzing {len(articles)} articles from {latest_file}...")
    
    # Run Layer 2 & 3
    analyzed = process_news(articles)
    
    # Layer 4: Sync
    if analyzed:
        sync_to_portal(analyzed)
    else:
        print("[Process] No articles survived the UPSC Filter.")

if __name__ == "__main__":
    run_engine()
