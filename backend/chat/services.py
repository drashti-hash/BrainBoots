import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")

def ask_ai(prompt):
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        return "Error: GROQ_API_KEY is not set or is using the default placeholder in your .env file."
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 800,
                "stream": False
            },
            timeout=30
        )
        if response.status_code != 200:
            err_msg = f"Groq API Error: {response.status_code} - {response.text}"
            print(err_msg)
            return err_msg
        res_data = response.json()
        return res_data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error in ask_ai: {e}")
        return f"Error: Could not get a response from Groq. ({str(e)})"


def ask_ai_stream(prompt):
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        yield "Error: GROQ_API_KEY is not set or is using the default placeholder in your .env file."
        return

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 800,
                "stream": True
            },
            stream=True,
            timeout=30
        )
        if response.status_code != 200:
            err_msg = f"Groq API Error: {response.status_code} - {response.text}"
            print(err_msg)
            yield err_msg
            return

        for line in response.iter_lines():
            if line:
                line_str = line.decode("utf-8", errors="ignore").strip()
                if line_str.startswith("data: "):
                    data_content = line_str[6:]
                    if data_content == "[DONE]":
                        break
                    try:
                        data_json = json.loads(data_content)
                        choices = data_json.get("choices", [])
                        if choices:
                            delta = choices[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                    except Exception as e:
                        print(f"Error parsing SSE stream line: {e}")
    except Exception as e:
        print(f"Error in ask_ai_stream: {e}")
        yield f" [Error: {str(e)}]"
