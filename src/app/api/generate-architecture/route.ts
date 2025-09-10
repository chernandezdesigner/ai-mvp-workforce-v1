import { NextRequest, NextResponse } from 'next/server';
import { AIFlowGenerator } from '@/lib/ai-flow-generator';

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      );
    }

    const architecture = await AIFlowGenerator.generateArchitecture(goal);
    
    return NextResponse.json({ architecture });
  } catch (error) {
    console.error('Architecture generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate architecture' },
      { status: 500 }
    );
  }
}