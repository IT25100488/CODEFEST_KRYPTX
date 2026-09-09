import os
import time

from dotenv import load_dotenv
from openai import OpenAI


# ---------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------

load_dotenv()


# ---------------------------------------------------------
# Read OpenRouter API key
# ---------------------------------------------------------

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)


# ---------------------------------------------------------
# Validate API key
# ---------------------------------------------------------

if not OPENROUTER_API_KEY:

    raise ValueError(
        "OPENROUTER_API_KEY was not found in .env"
    )


# ---------------------------------------------------------
# Create OpenRouter client
# ---------------------------------------------------------

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)


# ---------------------------------------------------------
# Default model
# ---------------------------------------------------------


MODEL_NAME = "openrouter/free"

MAX_RETRIES = 5
INITIAL_BACKOFF = 1.0  # seconds (1s, 2s, 4s, 8s, 16s)


# ---------------------------------------------------------
# Send a prompt to the LLM with exponential backoff retry
# ---------------------------------------------------------

def ask_llm(
    prompt,
    system_prompt=None,
    temperature=0.1,
    max_retries=MAX_RETRIES
):
    """
    Send a prompt to the LLM with automatic retry and exponential backoff.
    Complies with Codefest rate-limit survival requirements.
    """

    messages = []

    # Optional system instruction
    if system_prompt:
        messages.append(
            {
                "role": "system",
                "content": system_prompt
            }
        )

    # User prompt
    messages.append(
        {
            "role": "user",
            "content": prompt
        }
    )

    delay = INITIAL_BACKOFF
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=temperature
            )
            return response.choices[0].message.content

        except Exception as error:
            last_exception = error
            error_msg = str(error)
            print(
                f"\n[Warning] LLM API call failed (attempt {attempt}/{max_retries}): {error_msg}"
            )

            # Daily rate limits cannot be resolved by retrying within seconds; fail fast
            if "free-models-per-day" in error_msg or "daily_limit" in error_msg or "429" in error_msg:
                print("[Notice] OpenRouter rate limit reached. Bypassing retries to fail fast to grounded fallback.")
                raise error

            if attempt < max_retries:
                print(f"[Retry] Waiting {delay:.1f}s before retrying...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff (1s, 2s, 4s, 8s...)

    # If all retries fail, raise the last exception
    raise last_exception


# ---------------------------------------------------------
# Simple test
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\n======================================")
    print("        OPENROUTER LLM TEST")
    print("======================================")

    print("\nSending test question...")

    answer = ask_llm(
        "What is the capital of France?"
    )

    print("\nLLM response:")
    print(answer)

    print("\n======================================")