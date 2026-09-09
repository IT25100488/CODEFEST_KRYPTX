import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'A valid question is required.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: question.trim() }),
      // Generous timeout (3 minutes) for agentic multi-hop retrieval and answer synthesis
      signal: AbortSignal.timeout(180000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Backend error (${response.status}): ${errorText || response.statusText}`,
          isBackendError: true,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
    return NextResponse.json(
      {
        error: isTimeout
          ? 'The AI model took too long to complete its response. Try refining your question or asking again.'
          : `Could not connect to FastAPI backend at ${BACKEND_URL}. Ensure uvicorn is running. Details: ${errorMessage}`,
        isOffline: !isTimeout,
        isTimeout,
      },
      { status: isTimeout ? 504 : 503 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ status: 'online', data });
    }
    return NextResponse.json({ status: 'offline' }, { status: 503 });
  } catch {
    return NextResponse.json({ status: 'offline' }, { status: 503 });
  }
}
