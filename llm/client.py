import os

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


# ---------------------------------------------------------
# Send a prompt to the LLM
# ---------------------------------------------------------

def ask_llm(
    prompt,
    system_prompt=None,
    temperature=0.1
):

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

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=temperature
    )

    return response.choices[0].message.content


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