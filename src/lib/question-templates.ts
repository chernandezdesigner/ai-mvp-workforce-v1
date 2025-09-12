export interface QuestionTemplate {
  id: string;
  category: 'user_context' | 'functionality' | 'technical' | 'business' | 'ux';
  question: string;
  options: string[];
  why: string;
  required: boolean;
}

export const APP_TYPE_QUESTIONS: Record<string, QuestionTemplate[]> = {
  'food_delivery': [
    {
      id: 'delivery_area',
      category: 'business',
      question: 'What delivery model do you want to support?',
      options: [
        'Single city/local delivery only',
        'Multi-city platform like DoorDash',
        'Ghost kitchen/restaurant-owned delivery',
        'Peer-to-peer food sharing'
      ],
      why: 'Different delivery models require completely different user flows and business logic',
      required: true
    },
    {
      id: 'payment_flow',
      category: 'technical',
      question: 'How should payment processing work?',
      options: [
        'Pay on delivery (cash/card)',
        'Pre-payment with saved cards',
        'Subscription model with credits',
        'Mixed payment options'
      ],
      why: 'Payment timing affects order flow, trust, and fraud prevention design',
      required: true
    },
    {
      id: 'customization_level',
      category: 'functionality',
      question: 'How much order customization should be supported?',
      options: [
        'Simple - just quantity and basic options',
        'Moderate - ingredients, size, special requests',
        'Advanced - full customization like Chipotle app',
        'Minimal - pre-set meals only'
      ],
      why: 'Customization complexity dramatically impacts menu UI and cart flow',
      required: true
    }
  ],
  
  'task_management': [
    {
      id: 'collaboration_scope',
      category: 'functionality', 
      question: 'What level of collaboration do you need?',
      options: [
        'Personal only - no sharing',
        'Simple sharing - share lists with others',
        'Team collaboration - assign tasks, comments',
        'Enterprise - roles, permissions, reporting'
      ],
      why: 'Collaboration level determines information architecture and permission system complexity',
      required: true
    },
    {
      id: 'task_complexity',
      category: 'functionality',
      question: 'How complex should tasks be?',
      options: [
        'Simple - title, due date, done/not done',
        'Moderate - categories, priorities, subtasks',
        'Advanced - dependencies, time tracking, attachments',
        'Project-level - Gantt charts, resource allocation'
      ],
      why: 'Task complexity affects data model, UI density, and user cognitive load',
      required: true
    }
  ],

  'e_commerce': [
    {
      id: 'product_catalog',
      category: 'business',
      question: 'What type of products will you sell?',
      options: [
        'Physical products with shipping',
        'Digital products/downloads',
        'Services/appointments',
        'Mix of physical and digital'
      ],
      why: 'Product type determines checkout flow, fulfillment, and post-purchase experience',
      required: true
    },
    {
      id: 'inventory_management',
      category: 'technical',
      question: 'How should inventory be handled?',
      options: [
        'Simple - in stock / out of stock',
        'Quantity tracking with low stock alerts',  
        'Variant management (size, color, etc.)',
        'No inventory (dropshipping/infinite)'
      ],
      why: 'Inventory complexity affects product display, cart behavior, and admin requirements',
      required: true
    }
  ],

  'fitness_tracking': [
    {
      id: 'tracking_method',
      category: 'technical',
      question: 'How should fitness data be captured?',
      options: [
        'Manual entry only',
        'Wearable device integration (Apple Watch, Fitbit)',
        'Phone sensors (steps, GPS)',
        'Mix of manual and automatic'
      ],
      why: 'Data capture method affects onboarding, permissions, and user engagement patterns',
      required: true
    },
    {
      id: 'social_features',
      category: 'functionality',
      question: 'What social features do you want?',
      options: [
        'None - completely private',
        'Friends only - share with connections',
        'Community - public leaderboards, challenges',
        'Social media style - posts, likes, comments'
      ],
      why: 'Social features dramatically change privacy, content moderation, and engagement design',
      required: true
    }
  ]
};

export function detectAppType(prompt: string): string | null {
  const prompt_lower = prompt.toLowerCase();
  
  if (prompt_lower.includes('food') || prompt_lower.includes('delivery') || prompt_lower.includes('restaurant')) {
    return 'food_delivery';
  }
  if (prompt_lower.includes('task') || prompt_lower.includes('todo') || prompt_lower.includes('productivity')) {
    return 'task_management';
  }
  if (prompt_lower.includes('shop') || prompt_lower.includes('ecommerce') || prompt_lower.includes('e-commerce') || prompt_lower.includes('product')) {
    return 'e_commerce';
  }
  if (prompt_lower.includes('fitness') || prompt_lower.includes('workout') || prompt_lower.includes('health')) {
    return 'fitness_tracking';
  }
  
  return null;
}

export function getContextualQuestions(appType: string, userPrompt: string): QuestionTemplate[] {
  const baseQuestions = APP_TYPE_QUESTIONS[appType] || [];
  
  // Add universal questions that apply to all apps
  const universalQuestions: QuestionTemplate[] = [
    {
      id: 'target_users',
      category: 'user_context',
      question: 'Who are your primary users?',
      options: [
        'General consumers (all ages)',
        'Young adults (18-35)',
        'Business professionals',
        'Students and educators',
        'Specific industry professionals'
      ],
      why: 'User demographics determine appropriate UI complexity, onboarding, and feature priorities',
      required: true
    },
    {
      id: 'platform_priority',
      category: 'technical',
      question: 'What platforms should we prioritize?',
      options: [
        'Mobile-first (iOS and Android)',
        'Web-first (desktop and mobile web)',
        'Mobile app only',
        'Web app only'
      ],
      why: 'Platform choice affects navigation patterns, interaction design, and development approach',
      required: true
    }
  ];
  
  return [...baseQuestions, ...universalQuestions].slice(0, 4); // Max 4 questions
}