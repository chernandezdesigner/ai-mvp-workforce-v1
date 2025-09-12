import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const { userPrompt, appType } = await request.json();

    if (!userPrompt) {
      return NextResponse.json({ error: 'User prompt is required' }, { status: 400 });
    }

    const aiService = createAIService();
    const questionsPrompt = createQuestionsPrompt(userPrompt, appType);
    
    const response = await aiService.generateText(questionsPrompt);
    const questions = parseQuestionsResponse(response);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

function createQuestionsPrompt(userPrompt: string, appType?: string): string {
  return `You are a Senior Product Manager at Spotify with 10+ years experience gathering requirements for successful apps. You excel at asking the RIGHT questions to understand what users really need.

USER'S INITIAL REQUEST: "${userPrompt}"
${appType ? `DETECTED APP TYPE: ${appType}` : ''}

METHODOLOGY: Use the "5 Whys" + Jobs-to-be-Done framework
- Ask WHY they need this specific feature
- Understand the CONTEXT of use
- Clarify SUCCESS metrics
- Identify EDGE CASES and constraints

QUESTION CATEGORIES TO EXPLORE:

1. USER CONTEXT & GOALS
- Who is the primary user? (demographics, tech comfort, context)
- What job are they "hiring" this app to do?
- When/where will they use it most?

2. CORE FUNCTIONALITY 
- What are the 3 most important features?
- What should happen when [specific scenario]?
- How do users currently solve this problem?

3. TECHNICAL PREFERENCES
- Authentication method preferences?
- Data storage/sync requirements?
- Platform priorities (mobile-first, web, etc.)?

4. BUSINESS LOGIC
- What are the key user flows?
- What permissions/roles are needed?
- How should the app monetize (if applicable)?

5. UX PREFERENCES  
- Visual style preferences?
- Information density (simple vs. feature-rich)?
- Accessibility requirements?

QUESTION QUALITY RULES:
✅ Specific, actionable questions with clear options
✅ Address potential confusion in their request  
✅ Ask about edge cases and error scenarios
✅ Provide multiple choice when possible
❌ Generic questions that don't add value
❌ Technical jargon that confuses users

Generate exactly 3-5 questions that will significantly improve the app design. Return ONLY this JSON:

{
  "questions": [
    {
      "id": "q1",
      "category": "user_context|functionality|technical|business|ux", 
      "question": "Clear, specific question text",
      "options": ["Option A description", "Option B description", "Option C description"],
      "why": "Brief explanation of why this matters for the app design",
      "required": true/false
    }
  ],
  "reasoning": "Brief explanation of why these specific questions were chosen"
}`;
}

function parseQuestionsResponse(response: string): any {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse questions response:', error);
    // Fallback questions
    return {
      questions: [
        {
          id: "q1",
          category: "user_context",
          question: "Who is the primary user of this app?",
          options: ["General consumers", "Business professionals", "Students/learners", "Specific industry workers"],
          why: "Understanding the target user helps design appropriate complexity and features",
          required: true
        },
        {
          id: "q2", 
          category: "functionality",
          question: "What is the most important feature for your users?",
          options: ["Quick task completion", "Rich data visualization", "Social interaction", "Content consumption"],
          why: "Prioritizing the core value helps focus the user experience",
          required: true
        }
      ],
      reasoning: "Basic questions to gather essential context for app design"
    };
  }
}