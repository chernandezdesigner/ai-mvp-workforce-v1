import { createAIService } from './ai-providers';

export interface ThinkingStep {
  id: string;
  title: string;
  description: string;
  thought: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

export class AIThinking {
  /**
   * Generate real AI thinking process for a user request
   */
  static async generateThinkingProcess(userRequest: string): Promise<{
    steps: ThinkingStep[];
    thoughts: string[];
  }> {
    try {
      const aiService = createAIService();
      const thinkingPrompt = this.buildThinkingPrompt(userRequest);
      const response = await aiService.generateText(thinkingPrompt);
      
      return this.parseThinkingResponse(response);
    } catch (error) {
      console.warn('AI thinking failed, using fallback:', error);
      return this.generateFallbackThinking(userRequest);
    }
  }

  private static buildThinkingPrompt(userRequest: string): string {
    return `You are an expert UX designer and app architect. A user has asked you to: "${userRequest}"

Think through this request step by step and share your actual thought process. Be genuine and specific about how you would approach this.

Respond with a JSON object in this exact format:
{
  "thoughts": [
    "Your first genuine thought about their request...",
    "Your second thought as you analyze deeper...",
    "Your third thought about the solution approach...",
    "Your fourth thought about implementation details...",
    "Your final thought about the outcome..."
  ],
  "steps": [
    {
      "id": "analyze",
      "title": "Analyzing the request",
      "description": "Understanding what the user wants to build",
      "thought": "I need to break down what type of app this is and what the core user journey should be..."
    },
    {
      "id": "identify",
      "title": "Identifying key screens",
      "description": "Determining essential screens and flows",
      "thought": "Based on their description, I'm thinking they'll need these main screens..."
    },
    {
      "id": "structure",
      "title": "Structuring the flow",
      "description": "Organizing screens into logical user paths",
      "thought": "The user journey should flow like this to minimize friction..."
    },
    {
      "id": "optimize",
      "title": "Optimizing UX",
      "description": "Ensuring smooth user experience",
      "thought": "I should make sure the navigation is intuitive and follows modern ux principles..."
    }
  ]
}

Make your thoughts specific to their request. Don't be generic - actually think about their specific app idea and share genuine insights about the UX challenges and solutions.

Return ONLY the JSON object, no other text.`;
  }

  private static parseThinkingResponse(response: string): {
    steps: ThinkingStep[];
    thoughts: string[];
  } {
    try {
      // Clean the response to handle markdown code blocks
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(cleanResponse);
      
      const steps: ThinkingStep[] = (parsed.steps || []).map((step: any) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        thought: step.thought,
        status: 'pending' as const
      }));

      return {
        steps,
        thoughts: parsed.thoughts || []
      };
    } catch (error) {
      console.error('Failed to parse thinking response:', error);
      throw new Error('Invalid thinking response format');
    }
  }

  private static generateFallbackThinking(userRequest: string): {
    steps: ThinkingStep[];
    thoughts: string[];
  } {
    const lowerRequest = userRequest.toLowerCase();
    
    // Analyze the request to provide contextual thoughts
    let appType = 'general app';
    let specificThoughts: string[] = [];
    let specificSteps: ThinkingStep[] = [];

    if (lowerRequest.includes('todo') || lowerRequest.includes('task')) {
      appType = 'task management app';
      specificThoughts = [
        `I see they want a ${appType}. This needs to focus on task creation, organization, and completion.`,
        `For task management, the core flow should be: add task → organize → complete → review progress.`,
        `I should include features like task lists, due dates, and progress tracking.`,
        `The navigation should be simple - probably a tab-based layout with tasks, categories, and profile.`,
        `I'll make sure the task creation flow is quick and intuitive - that's the most important interaction.`
      ];
      
      specificSteps = [
        {
          id: 'analyze',
          title: 'Analyzing task management needs',
          description: 'Understanding task workflow requirements',
          thought: 'Task apps need to minimize friction in adding and completing tasks. The core loop is add → organize → complete.',
          status: 'pending'
        },
        {
          id: 'identify',
          title: 'Identifying key screens',
          description: 'Planning essential task management screens',
          thought: 'I need a task list, add task form, task details, and probably categories or projects to organize tasks.',
          status: 'pending'
        },
        {
          id: 'structure',
          title: 'Structuring task flow',
          description: 'Organizing screens for optimal task management',
          thought: 'The main flow should be Home (task list) → Add Task → Task Details → Back to Home. Quick and efficient.',
          status: 'pending'
        },
        {
          id: 'optimize',
          title: 'Optimizing for productivity',
          description: 'Ensuring the app actually helps users be productive',
          thought: 'I should add quick actions, swipe gestures, and make sure completing tasks feels satisfying.',
          status: 'pending'
        }
      ];
    } else if (lowerRequest.includes('social') || lowerRequest.includes('chat') || lowerRequest.includes('message')) {
      appType = 'social app';
      specificThoughts = [
        `They want a ${appType}. This is all about connecting people and facilitating communication.`,
        `Social apps need user profiles, friend/follow systems, and content sharing capabilities.`,
        `The core flow is usually: sign up → set up profile → discover/connect → share/interact → engage.`,
        `I need to think about content feeds, messaging, notifications, and user safety features.`,
        `The navigation should probably be tab-based with feed, messages, profile, and discovery sections.`
      ];
      
      specificSteps = [
        {
          id: 'analyze',
          title: 'Analyzing social interaction needs',
          description: 'Understanding how users will connect and communicate',
          thought: 'Social apps are about relationships and content. I need to design for both discovery and ongoing engagement.',
          status: 'pending'
        },
        {
          id: 'identify',
          title: 'Identifying social features',
          description: 'Planning profiles, feeds, and interaction screens',
          thought: 'Core screens: user profiles, content feed, messaging, friend/follow management, and content creation.',
          status: 'pending'
        },
        {
          id: 'structure',
          title: 'Structuring social flow',
          description: 'Creating intuitive social navigation patterns',
          thought: 'Tab navigation with Home Feed → Messages → Create → Notifications → Profile. Standard but effective.',
          status: 'pending'
        },
        {
          id: 'optimize',
          title: 'Optimizing engagement',
          description: 'Designing for healthy social interaction',
          thought: 'I should focus on meaningful connections over vanity metrics. Clear privacy controls are essential.',
          status: 'pending'
        }
      ];
    } else if (lowerRequest.includes('ecommerce') || lowerRequest.includes('shop') || lowerRequest.includes('store')) {
      appType = 'e-commerce app';
      specificThoughts = [
        `This is an ${appType}. The goal is converting browsers into buyers with a smooth shopping experience.`,
        `E-commerce flows need: browse → search → product details → add to cart → checkout → order confirmation.`,
        `I should focus on product discovery, easy purchasing, and building trust through design.`,
        `Key screens include product catalog, search/filters, product details, shopping cart, and checkout flow.`,
        `Mobile commerce is all about reducing friction - especially in the checkout process.`
      ];
      
      specificSteps = [
        {
          id: 'analyze',
          title: 'Analyzing shopping behavior',
          description: 'Understanding the customer purchase journey',
          thought: 'E-commerce is about conversion. Every screen should either help users find products or complete purchases.',
          status: 'pending'
        },
        {
          id: 'identify',
          title: 'Identifying commerce screens',
          description: 'Planning product discovery and purchase flow',
          thought: 'I need: home/categories → product listing → product details → cart → checkout → confirmation.',
          status: 'pending'
        },
        {
          id: 'structure',
          title: 'Structuring purchase flow',
          description: 'Optimizing the path from browse to buy',
          thought: 'The flow should minimize steps to purchase while providing enough product information to build confidence.',
          status: 'pending'
        },
        {
          id: 'optimize',
          title: 'Optimizing conversion',
          description: 'Reducing friction in the buying process',
          thought: 'Fast checkout, clear pricing, good product images, and trust signals are crucial for mobile commerce.',
          status: 'pending'
        }
      ];
    } else {
      // Generic app fallback
      specificThoughts = [
        `Looking at their request: "${userRequest}". I need to understand the core user need and build around that.`,
        `Every app needs a clear user journey. I should identify the main actions users will take.`,
        `I'll start with essential screens and add complexity only where it adds real value.`,
        `The navigation should be intuitive - users shouldn't have to think about how to move through the app.`,
        `I'll focus on the primary user flow first, then add supporting features and edge cases.`
      ];
      
      specificSteps = [
        {
          id: 'analyze',
          title: 'Analyzing the request',
          description: 'Understanding what the user wants to build',
          thought: 'I need to identify the core purpose of this app and who the primary users will be.',
          status: 'pending'
        },
        {
          id: 'identify',
          title: 'Identifying key screens',
          description: 'Determining essential screens and features',
          thought: 'Based on their description, I should map out the main screens and user actions.',
          status: 'pending'
        },
        {
          id: 'structure',
          title: 'Structuring the flow',
          description: 'Organizing screens into logical user paths',
          thought: 'The user journey should be logical and minimize the steps to complete key tasks.',
          status: 'pending'
        },
        {
          id: 'optimize',
          title: 'Optimizing UX',
          description: 'Ensuring smooth user experience',
          thought: 'I should follow modern ux principles and make sure the navigation is intuitive.',
          status: 'pending'
        }
      ];
    }

    return {
      steps: specificSteps,
      thoughts: specificThoughts
    };
  }
}
