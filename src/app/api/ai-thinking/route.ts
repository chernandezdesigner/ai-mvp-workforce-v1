import { NextRequest, NextResponse } from 'next/server';
import { AIThinking } from '@/lib/ai-thinking';

export async function POST(request: NextRequest) {
  try {
    const { userRequest } = await request.json();

    if (!userRequest || typeof userRequest !== 'string') {
      return NextResponse.json(
        { error: 'User request is required' },
        { status: 400 }
      );
    }

    const thinkingProcess = await AIThinking.generateThinkingProcess(userRequest);

    return NextResponse.json(thinkingProcess);
  } catch (error) {
    console.error('Error generating thinking process:', error);
    return NextResponse.json(
      { error: 'Failed to generate thinking process' },
      { status: 500 }
    );
  }
}
