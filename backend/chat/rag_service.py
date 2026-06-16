import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")


def generate_rag_response(query, context):
    """
    Generate answer using retrieved RAG context.
    """

    if not context or not context.strip():
        return "Information not found in the indexed documents."

    prompt = f"""
You are a Brainboot AI Assistant.

Use ONLY the provided context to answer.

Rules:
1. Answer only from the context.
2. Do not use your own knowledge.
3. If the answer is not found in the context, reply exactly:
   Information not found in the indexed documents.
4. Do not guess.
5. Do not make up information.

Context:
{context}

Question:
{query}

Answer:
"""

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
                "temperature": 0.0,
                "max_tokens": 800,
                "stream": False
            },
            timeout=30
        )

        response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to Groq server."

    except requests.exceptions.Timeout:
        return "Error: Groq request timed out."

    except requests.exceptions.RequestException as e:
        return f"Request Error: {str(e)}"

    except Exception as e:
        return f"Unexpected Error: {str(e)}"
