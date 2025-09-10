import { 
  AppArchitecture, 
  Screen, 
  Transition, 
  ApiEndpoint, 
  ScreenType, 
  TransitionTrigger, 
  HttpMethod, 
  ComplexityLevel,
  AppFlow,
  FlowNode,
  FlowEdge,
  NavigationPattern
} from '@/types/app-architecture';
import { createAIService } from './ai-providers';

export class AIFlowGenerator {
  /**
   * Generate app architecture from a user goal description
   */
  static async generateArchitecture(goal: string): Promise<AppArchitecture> {
    try {
      // Try AI generation first
      const aiService = createAIService();
      const aiResponse = await this.generateWithAI(aiService, goal);
      return aiResponse;
    } catch (error) {
      console.warn('AI generation failed, falling back to mock analysis:', error);
      // Fallback to mock implementation if AI fails
      return this.generateMockArchitecture(goal);
    }
  }

  /**
   * Generate architecture using AI
   */
  private static async generateWithAI(aiService: any, goal: string): Promise<AppArchitecture> {
    const prompt = this.buildArchitecturePrompt(goal);
    const response = await aiService.generateText(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return this.validateAndNormalizeArchitecture(parsed, goal);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI returned invalid JSON');
    }
  }

  /**
   * Build the AI prompt for architecture generation
   */
  private static buildArchitecturePrompt(goal: string): string {
    return `You are a Senior UX Designer and Information Architect with 10+ years of experience designing mobile and web applications. You understand modern UX principles, user psychology, accessibility standards, and contemporary app design patterns.

USER GOAL: "${goal}"

DESIGN PHILOSOPHY:
Apply these core UX principles in your architecture:
- User-Centered Design: Every screen serves a clear user need
- Progressive Disclosure: Present information in digestible chunks
- Cognitive Load Management: Minimize mental effort required
- Accessibility First: Design for all users from the start
- Task-Oriented Flow: Optimize for user task completion
- Error Prevention: Design to prevent user mistakes
- Feedback & Affordances: Clear visual cues and system feedback
- Consistency: Predictable patterns across the experience

MOBILE-FIRST APPROACH:
This is an APP builder, not a website builder. Design native app experiences:
- Start with app launch (no landing pages)
- Use mobile-native navigation patterns (tabs, drawers, stacks)
- Consider touch interactions and mobile contexts
- Design for one-handed use when possible
- Include empty states, loading states, and error handling
- Plan for offline scenarios where relevant

USER JOURNEY ANALYSIS:
Before designing screens, analyze:
1. WHO is the primary user? (new user, returning user, admin, etc.)
2. WHAT is their core job-to-be-done?
3. WHERE will they use this app? (context of use)
4. WHEN in their day/workflow will they use it?
5. WHY would they choose this over alternatives?
6. HOW technically savvy are they?

COMPREHENSIVE SCREEN ARCHITECTURE:
Design the COMPLETE user experience including:

AUTHENTICATION & ONBOARDING FLOW:
- App Launch/Splash (if needed)
- Authentication (Login/Register with proper validation)
- Onboarding (introduce key features, set preferences)
- Email/Phone Verification (if required)

CORE APPLICATION FLOW:
- Home/Dashboard (overview, quick actions, status)
- Primary task screens (list, detail, form, search)
- Navigation screens (tabs, drawer, settings)

SUPPORTING SCREENS:
- Profile & Account Management
- Settings & Preferences  
- Help & Support
- Error States (network, permission, validation)
- Empty States (no data, first use)
- Loading States (data fetching, processing)

ADVANCED FEATURES (when relevant):
- Notifications & Communication
- Search & Filter
- Media handling (camera, gallery)
- Social features (if applicable)
- Analytics/Reports (for business apps)

Generate a JSON object with this EXACT structure:
{
  "appName": "string - descriptive, memorable app name",
  "description": "string - clear value proposition (what problem does this solve?)",
  "complexity": "simple|moderate|complex",
  "tags": ["array", "of", "relevant", "domain", "tags"],
  "primaryUserFlow": "onboarding|task_completion|discovery|authentication|transaction|content_consumption|social_interaction|productivity",
  "targetAudience": ["primary", "user", "types"],
  "screens": [
    {
      "name": "string - clear, action-oriented screen name",
      "type": "auth|dashboard|home|list|grid|detail|form|search|filter|profile|settings|preferences|account|chat|notifications|feed|cart|checkout|payment|order_history|gallery|camera|media_viewer|tab_bar|drawer|modal|bottom_sheet|error|loading|empty_state|tutorial|help|onboarding|verification|map|calendar|analytics|reports",
      "description": "string - what the user accomplishes on this screen (job-to-be-done)",
      "components": ["array", "of", "specific", "UI", "components"],
      "requiresAuth": boolean,
      "userIntent": "string - what the user is trying to accomplish",
      "cognitiveLoad": "low|medium|high",
      "navigationPattern": "tab_based|drawer|stack|modal|bottom_sheet|wizard|master_detail|card_stack",
      "interactions": [
        {
          "type": "tap|swipe|drag|long_press|scroll",
          "target": "string - what element",
          "result": "string - what happens"
        }
      ],
      "formFields": [{"name": "string", "type": "text|email|password|number|phone|date|select|textarea|checkbox|radio|file", "required": boolean, "validation": "string"}], // only for forms
      "accessibilityFeatures": ["screen_reader", "keyboard_nav", "focus_management", "color_contrast"],
      "emptyState": "string - what shows when no data/first time use",
      "errorHandling": ["validation_errors", "network_errors", "permission_errors"]
    }
  ],
  "transitions": [
    {
      "from": "string - source screen name (must match exactly)",
      "to": "string - target screen name (must match exactly)", 
      "trigger": "user_action|api_success|api_error|navigation|condition",
      "description": "string - specific user action or system event",
      "userMotivation": "string - why would the user take this action?"
    }
  ]
}

CRITICAL REQUIREMENTS:

APP LAUNCH PATTERNS (NO LANDING PAGES):
1. Start with "App Launch" → Authentication flow OR direct to main app (if no auth)
2. For apps requiring auth: App Launch → Login/Register choice → Onboarding → Main App
3. For apps without auth: App Launch → (optional onboarding) → Main App
4. Always include proper onboarding for new users

COMPLETE USER JOURNEYS:
1. Map the ENTIRE user journey from app launch to task completion
2. Include authentication, onboarding, core tasks, and account management
3. Design for both new and returning users
4. Include error recovery paths and edge cases
5. Every screen must be reachable and serve a purpose

MODERN UX PATTERNS:
1. Use mobile-first navigation (tabs, drawer, stack)
2. Include empty states for first-time use
3. Design loading states for data fetching
4. Plan error states for network/validation issues
5. Consider accessibility from the start
6. Use progressive disclosure for complex features

TASK-ORIENTED DESIGN:
1. Organize screens around user tasks, not technical structure
2. Minimize steps to complete primary tasks
3. Group related functionality logically
4. Provide clear paths forward and back
5. Design for task interruption and resumption

VALIDATION & CONSISTENCY:
1. Use exact screen names in transitions (case sensitive)
2. Ensure every transition has a logical trigger
3. Verify all screens are connected to the flow
4. Check that user motivations align with transitions
5. Maintain consistent interaction patterns

Return ONLY the JSON object, no additional text or explanation.`;
  }

  /**
   * Validate and normalize AI-generated architecture
   */
  private static validateAndNormalizeArchitecture(parsed: any, originalGoal: string): AppArchitecture {
    const id = `app_${Date.now()}`;
    
    // Normalize screens with enhanced UX data
    const screens: Screen[] = (parsed.screens || []).map((screen: any, index: number) => ({
      id: `screen_${index}`,
      name: screen.name || `Screen ${index}`,
      type: this.normalizeScreenType(screen.type),
      description: screen.description || '',
      components: Array.isArray(screen.components) ? screen.components : [],
      data: {
        requiresAuth: screen.requiresAuth || false,
        formFields: screen.formFields || [],
        userJourney: screen.userIntent ? {
          userIntent: screen.userIntent,
          emotionalState: 'focused',
          cognitiveLoad: screen.cognitiveLoad || 'medium',
          contextOfUse: 'mobile',
          userType: screen.requiresAuth ? 'returning' : 'new'
        } : undefined,
        accessibility: screen.accessibilityFeatures ? {
          screenReader: screen.accessibilityFeatures.includes('screen_reader'),
          keyboardNavigation: screen.accessibilityFeatures.includes('keyboard_nav'),
          colorBlindFriendly: screen.accessibilityFeatures.includes('color_contrast'),
          largeText: true,
          reducedMotion: false,
          focusManagement: screen.accessibilityFeatures.includes('focus_management') ? ['main-content'] : []
        } : undefined,
        interactions: screen.interactions ? screen.interactions.map((interaction: any) => ({
          type: interaction.type,
          target: interaction.target,
          feedback: 'visual',
          result: interaction.result
        })) : undefined,
        navigationPattern: screen.navigationPattern ? this.normalizeNavigationPattern(screen.navigationPattern) : undefined
      }
    }));

    // No API endpoints in UX flow phase - focus on user experience only
    const apiEndpoints: ApiEndpoint[] = [];

    // Normalize transitions with enhanced context
    const transitions: Transition[] = (parsed.transitions || []).map((transition: any, index: number) => {
      const fromScreen = screens.find(s => s.name === transition.from);
      const toScreen = screens.find(s => s.name === transition.to);
      
      return {
        id: `transition_${index}`,
        from: fromScreen?.id || screens[0]?.id || `screen_0`,
        to: toScreen?.id || screens[1]?.id || `screen_1`,
        trigger: this.normalizeTransitionTrigger(transition.trigger || 'user_action'),
        description: transition.description || 'User navigates',
        condition: transition.userMotivation
      };
    });

    return {
      id,
      name: parsed.appName || 'Generated App',
      description: parsed.description || originalGoal,
      screens,
      transitions,
      apiEndpoints,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        complexity: this.normalizeComplexity(parsed.complexity),
        estimatedScreens: screens.length,
        estimatedApis: 0 // No APIs in UX flow phase
      }
    };
  }

  /**
   * Fallback mock architecture generation
   */
  private static generateMockArchitecture(goal: string): AppArchitecture {
    const analysis = this.analyzeGoal(goal);
    
    const screens = this.generateScreens(analysis);
    const apiEndpoints: ApiEndpoint[] = []; // No APIs in UX flow phase
    const transitions = this.generateTransitions(screens, analysis);
    
    return {
      id: `app_${Date.now()}`,
      name: analysis.appName,
      description: goal,
      screens,
      transitions,
      apiEndpoints,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: analysis.tags,
        complexity: analysis.complexity,
        estimatedScreens: screens.length,
        estimatedApis: 0 // No APIs in UX flow phase
      }
    };
  }

  /**
   * Convert AppArchitecture to React Flow format
   */
  static architectureToFlow(architecture: AppArchitecture): AppFlow {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];

    // Add start node - positioned to the left of the main flow
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: 100, y: 250 }, // Align with main flow BASE_Y
      data: { label: 'Start' }
    });

    // Create clean flow based on user's mock diagram - linear with proper branching
    const STEP_SPACING = 500; // Increased horizontal spacing to prevent overlapping
    const BRANCH_SPACING = 300; // Increased vertical spacing for parallel branches
    const BASE_Y = 250; // Starting Y position for main flow
    
    // Define positions based on logical flow progression like mock diagram
    const flowPositions: { [key: string]: { x: number; y: number } } = {};
    
    // Find key screen types for modern app flows
    const launchScreen = architecture.screens.find(s => s.type === ScreenType.LOADING);
    const authScreens = architecture.screens.filter(s => s.type === ScreenType.AUTH);
    const onboardingScreen = architecture.screens.find(s => s.type === ScreenType.ONBOARDING);
    const dashboardScreen = architecture.screens.find(s => s.type === ScreenType.DASHBOARD || s.type === ScreenType.HOME);
    const listScreen = architecture.screens.find(s => s.type === ScreenType.LIST || s.type === ScreenType.GRID);
    const detailScreen = architecture.screens.find(s => s.type === ScreenType.DETAIL);
    const formScreen = architecture.screens.find(s => s.type === ScreenType.FORM);
    const profileScreen = architecture.screens.find(s => s.type === ScreenType.PROFILE);
    const settingsScreen = architecture.screens.find(s => s.type === ScreenType.SETTINGS);
    
    let currentX = 400; // Start position
    
    // Step 1: App Launch screen (if present)
    if (launchScreen) {
      flowPositions[launchScreen.id] = { x: currentX, y: BASE_Y };
      currentX += STEP_SPACING;
    }
    
    // Step 2: Auth screens - parallel branches that converge
    if (authScreens.length > 0) {
      const authCenterX = currentX;
      authScreens.forEach((screen, index) => {
        const branchY = BASE_Y + (index - (authScreens.length - 1) / 2) * BRANCH_SPACING;
        flowPositions[screen.id] = { x: authCenterX, y: branchY };
      });
      currentX += STEP_SPACING;
    }
    
    // Step 3: Onboarding (after auth or directly after launch)
    if (onboardingScreen) {
      flowPositions[onboardingScreen.id] = { x: currentX, y: BASE_Y };
      currentX += STEP_SPACING;
    }
    
    // Step 4: Dashboard/Home - main app entry point
    if (dashboardScreen) {
      flowPositions[dashboardScreen.id] = { x: currentX, y: BASE_Y };
      currentX += STEP_SPACING;
    }
    
    // Step 5: Organize feature screens in clean layout to avoid arrow mess
    
    // Main list screen on main flow
    if (listScreen) {
      flowPositions[listScreen.id] = { x: currentX, y: BASE_Y };
      currentX += STEP_SPACING;
    }
    
    // Detail and form screens in organized sub-flow
    const subFlowY = BASE_Y + BRANCH_SPACING; // Below main flow
    let subFlowX = currentX - STEP_SPACING; // Align with list screen
    
    if (detailScreen) {
      flowPositions[detailScreen.id] = { x: subFlowX, y: subFlowY };
      subFlowX += STEP_SPACING;
    }
    
    if (formScreen) {
      flowPositions[formScreen.id] = { x: subFlowX, y: subFlowY };
    }
    
    // Step 5: User screens - continue main flow after features
    const userScreens = [profileScreen, settingsScreen].filter(Boolean);
    userScreens.forEach((screen, index) => {
      if (screen) {
        flowPositions[screen.id] = { x: currentX + (index * STEP_SPACING), y: BASE_Y };
      }
    });
    
    // Apply positions to all screens
    architecture.screens.forEach((screen) => {
      const position = flowPositions[screen.id] || { x: currentX, y: BASE_Y };
      
      nodes.push({
        id: screen.id,
        type: 'screen',
        position: screen.position || position,
        data: {
          label: screen.name,
          description: screen.description,
          screenType: screen.type,
          requiresAuth: screen.data.requiresAuth
        }
      });
    });

    // No API nodes in UX flow phase - focus on user experience screens only

    // Generate edges based on the transitions from AI + logical flow patterns
    const addedEdges = new Set<string>(); // Prevent duplicate edges
    
    // 1. Always start with Start → First Screen (App Launch Flow)
    const firstScreen = launchScreen || authScreens[0] || onboardingScreen || dashboardScreen || architecture.screens[0];
    if (firstScreen) {
      const edgeId = `start-to-${firstScreen.id}`;
      if (!addedEdges.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: 'start',
          target: firstScreen.id,
          label: 'App Launch'
        });
        addedEdges.add(edgeId);
      }
    }
    
    // 2. Add essential forward-flow edges only (reduce clutter)
    const essentialTransitions = architecture.transitions.filter(transition => {
      const sourceScreen = architecture.screens.find(s => s.id === transition.from);
      const targetScreen = architecture.screens.find(s => s.id === transition.to);
      
      // Only include forward-moving transitions and essential returns
      if (!sourceScreen || !targetScreen) return false;
      
      // Include main flow progression (updated for app launch patterns)
      if (sourceScreen.type === ScreenType.LOADING && targetScreen.type === ScreenType.AUTH) return true;
      if (sourceScreen.type === ScreenType.AUTH && targetScreen.type === ScreenType.ONBOARDING) return true;
      if (sourceScreen.type === ScreenType.AUTH && targetScreen.type === ScreenType.DASHBOARD) return true;
      if (sourceScreen.type === ScreenType.ONBOARDING && targetScreen.type === ScreenType.DASHBOARD) return true;
      if (sourceScreen.type === ScreenType.DASHBOARD && targetScreen.type === ScreenType.LIST) return true;
      if (sourceScreen.type === ScreenType.HOME && targetScreen.type === ScreenType.LIST) return true;
      
      // Include essential CRUD actions (but limit returns)
      if (sourceScreen.type === ScreenType.LIST && targetScreen.type === ScreenType.DETAIL) return true;
      if (sourceScreen.type === ScreenType.LIST && targetScreen.type === ScreenType.FORM) return true;
      
      // Skip most return arrows to reduce clutter - they're implied
      return false;
    });
    
    essentialTransitions.forEach(transition => {
      const edgeId = `${transition.from}-to-${transition.to}`;
      if (!addedEdges.has(edgeId)) {
        const sourceScreen = architecture.screens.find(s => s.id === transition.from);
        const targetScreen = architecture.screens.find(s => s.id === transition.to);
        
        let label = 'Continue';
        
        // Smart labeling based on screen types (updated for app launch patterns)
        if (sourceScreen && targetScreen) {
          if (sourceScreen.type === ScreenType.LOADING && targetScreen.type === ScreenType.AUTH) {
            label = targetScreen.name.toLowerCase().includes('login') ? 'Login' : 'Sign Up';
          } else if (sourceScreen.type === ScreenType.AUTH && targetScreen.type === ScreenType.ONBOARDING) {
            label = 'Get Started';
          } else if (sourceScreen.type === ScreenType.AUTH && targetScreen.type === ScreenType.DASHBOARD) {
            label = 'Continue';
          } else if (sourceScreen.type === ScreenType.ONBOARDING && targetScreen.type === ScreenType.DASHBOARD) {
            label = 'Enter App';
          } else if (sourceScreen.type === ScreenType.DASHBOARD && targetScreen.type === ScreenType.LIST) {
            label = 'View Items';
          } else if (sourceScreen.type === ScreenType.HOME && targetScreen.type === ScreenType.LIST) {
            label = 'View Items';
          } else if (sourceScreen.type === ScreenType.LIST && targetScreen.type === ScreenType.DETAIL) {
            label = 'View Details';
          } else if (sourceScreen.type === ScreenType.LIST && targetScreen.type === ScreenType.FORM) {
            label = 'Add New';
          }
        }
        
        edges.push({
          id: edgeId,
          source: transition.from,
          target: transition.to,
          label: label
        });
        addedEdges.add(edgeId);
      }
    });
    
    // 3. Add missing logical connections if AI missed them
    
    // Launch to Auth (if missing)
    if (launchScreen && authScreens.length > 0) {
      authScreens.forEach(authScreen => {
        const edgeId = `${launchScreen.id}-to-${authScreen.id}`;
        if (!addedEdges.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: launchScreen.id,
            target: authScreen.id,
            label: authScreen.name.toLowerCase().includes('login') ? 'Login' : 'Sign Up'
          });
          addedEdges.add(edgeId);
        }
      });
    }
    
    // Launch to Onboarding (if no auth required)
    if (launchScreen && onboardingScreen && authScreens.length === 0) {
      const edgeId = `${launchScreen.id}-to-${onboardingScreen.id}`;
      if (!addedEdges.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: launchScreen.id,
          target: onboardingScreen.id,
          label: 'Get Started'
        });
        addedEdges.add(edgeId);
      }
    }
    
    // Auth to Dashboard convergence (if missing)
    if (dashboardScreen && authScreens.length > 0) {
      authScreens.forEach(authScreen => {
        const edgeId = `${authScreen.id}-to-${dashboardScreen.id}`;
        if (!addedEdges.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: authScreen.id,
            target: dashboardScreen.id,
            label: 'Continue'
          });
          addedEdges.add(edgeId);
        }
      });
    }
    
    // Dashboard to List (if missing)
    if (dashboardScreen && listScreen) {
      const edgeId = `${dashboardScreen.id}-to-${listScreen.id}`;
      if (!addedEdges.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: dashboardScreen.id,
          target: listScreen.id,
          label: 'View Items'
        });
        addedEdges.add(edgeId);
      }
    }

    return { nodes, edges };
  }

  private static analyzeGoal(goal: string) {
    // Simple keyword-based analysis - in production, use AI/NLP
    const lowerGoal = goal.toLowerCase();
    
    const hasAuth = lowerGoal.includes('login') || lowerGoal.includes('auth') || lowerGoal.includes('user');
    const hasDashboard = lowerGoal.includes('dashboard') || lowerGoal.includes('home');
    const hasList = lowerGoal.includes('list') || lowerGoal.includes('todo') || lowerGoal.includes('task');
    const hasProfile = lowerGoal.includes('profile') || lowerGoal.includes('account');
    const hasSettings = lowerGoal.includes('settings') || lowerGoal.includes('config');
    
    // Determine app type and name
    let appName = 'My App';
    let tags: string[] = [];
    
    if (lowerGoal.includes('todo')) {
      appName = 'Todo App';
      tags = ['productivity', 'task-management'];
    } else if (lowerGoal.includes('social')) {
      appName = 'Social App';
      tags = ['social', 'networking'];
    } else if (lowerGoal.includes('ecommerce') || lowerGoal.includes('shop')) {
      appName = 'E-commerce App';
      tags = ['ecommerce', 'shopping'];
    } else if (lowerGoal.includes('blog')) {
      appName = 'Blog App';
      tags = ['content', 'blogging'];
    }

    // Determine complexity
    let complexity = ComplexityLevel.SIMPLE;
    const featureCount = [hasAuth, hasDashboard, hasList, hasProfile, hasSettings].filter(Boolean).length;
    if (featureCount > 3) complexity = ComplexityLevel.COMPLEX;
    else if (featureCount > 1) complexity = ComplexityLevel.MODERATE;

    return {
      appName,
      tags,
      complexity,
      features: {
        hasAuth,
        hasDashboard,
        hasList,
        hasProfile,
        hasSettings
      }
    };
  }

  private static generateScreens(analysis: any): Screen[] {
    const screens: Screen[] = [];
    let screenIndex = 0;

    // App Launch/Splash screen (optional, only if needed for loading/branding)
    if (analysis.complexity !== ComplexityLevel.SIMPLE) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'App Launch',
        type: ScreenType.LOADING,
        description: 'App initialization and loading screen',
        components: ['AppLogo', 'LoadingIndicator', 'VersionInfo'],
        data: { 
          requiresAuth: false,
          userJourney: {
            userIntent: 'Launch the app',
            emotionalState: 'excited',
            cognitiveLoad: 'low',
            contextOfUse: 'mobile',
            userType: 'returning'
          }
        }
      });
    }

    // Auth screens
    if (analysis.features.hasAuth) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Login',
        type: ScreenType.AUTH,
        description: 'User authentication screen',
        components: ['LoginForm', 'SignupLink', 'ForgotPassword'],
        data: { 
          requiresAuth: false,
          formFields: [
            { name: 'email', type: 'email', required: true },
            { name: 'password', type: 'password', required: true }
          ]
        }
      });

      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Register',
        type: ScreenType.AUTH,
        description: 'User registration screen',
        components: ['RegisterForm', 'LoginLink'],
        data: { 
          requiresAuth: false,
          formFields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'password', type: 'password', required: true }
          ]
        }
      });
    }

    // Onboarding (essential for good UX)
    screens.push({
      id: `screen_${screenIndex++}`,
      name: 'Welcome',
      type: ScreenType.ONBOARDING,
      description: 'Introduction to app features and setup user preferences',
      components: ['WelcomeMessage', 'FeatureHighlights', 'GetStartedButton', 'SkipButton'],
      data: { 
        requiresAuth: false,
        userJourney: {
          userIntent: 'Learn about the app and get started',
          emotionalState: 'excited',
          cognitiveLoad: 'low',
          contextOfUse: 'mobile',
          userType: 'new'
        }
      }
    });

    // Dashboard
    if (analysis.features.hasDashboard) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Dashboard',
        type: ScreenType.DASHBOARD,
        description: 'Main dashboard with overview and key metrics',
        components: ['StatsCards', 'RecentActivity', 'QuickActions'],
        data: { requiresAuth: analysis.features.hasAuth }
      });
    }

    // List screens
    if (analysis.features.hasList) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Items List',
        type: ScreenType.LIST,
        description: 'List of items with search and filter capabilities',
        components: ['SearchBar', 'FilterControls', 'ItemList', 'Pagination'],
        data: { 
          requiresAuth: analysis.features.hasAuth,
          listItems: {
            itemType: 'item',
            displayFields: ['title', 'status', 'createdAt'],
            actions: ['view', 'edit', 'delete']
          }
        }
      });

      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Item Detail',
        type: ScreenType.DETAIL,
        description: 'Detailed view of a single item',
        components: ['ItemHeader', 'ItemContent', 'ActionButtons'],
        data: { requiresAuth: analysis.features.hasAuth }
      });

      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Add Item',
        type: ScreenType.FORM,
        description: 'Form to create a new item',
        components: ['ItemForm', 'SubmitButton', 'CancelButton'],
        data: { 
          requiresAuth: analysis.features.hasAuth,
          formFields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: false },
            { name: 'priority', type: 'select', required: false }
          ]
        }
      });
    }

    // Profile
    if (analysis.features.hasProfile) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Profile',
        type: ScreenType.PROFILE,
        description: 'User profile with personal information',
        components: ['ProfileHeader', 'ProfileForm', 'AvatarUpload'],
        data: { requiresAuth: true }
      });
    }

    // Settings
    if (analysis.features.hasSettings) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Settings',
        type: ScreenType.SETTINGS,
        description: 'App settings and preferences',
        components: ['SettingsForm', 'ThemeToggle', 'NotificationSettings'],
        data: { requiresAuth: analysis.features.hasAuth }
      });
    }

    // Error handling screens (essential for good UX)
    screens.push({
      id: `screen_${screenIndex++}`,
      name: 'Network Error',
      type: ScreenType.ERROR,
      description: 'Handle network connectivity issues',
      components: ['ErrorMessage', 'RetryButton', 'OfflineBanner'],
      data: { 
        requiresAuth: false,
        userJourney: {
          userIntent: 'Understand what went wrong and how to fix it',
          emotionalState: 'frustrated',
          cognitiveLoad: 'low',
          contextOfUse: 'mobile',
          userType: 'returning'
        }
      }
    });

    // Empty state screen (for better first-time experience)
    if (analysis.features.hasList) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Empty List',
        type: ScreenType.EMPTY_STATE,
        description: 'First-time user experience when no data exists',
        components: ['EmptyStateIllustration', 'WelcomeMessage', 'CreateFirstItemButton'],
        data: { 
          requiresAuth: analysis.features.hasAuth,
          userJourney: {
            userIntent: 'Understand how to get started with the app',
            emotionalState: 'confused',
            cognitiveLoad: 'low',
            contextOfUse: 'mobile',
            userType: 'new'
          }
        }
      });
    }

    return screens;
  }

  // API endpoints removed - focusing only on UX flow in this phase

  private static generateTransitions(screens: Screen[], analysis: any): Transition[] {
    const transitions: Transition[] = [];
    let transitionIndex = 0;

    // Find key screens for modern app flow
    const launchScreen = screens.find(s => s.type === ScreenType.LOADING);
    const authScreens = screens.filter(s => s.type === ScreenType.AUTH);
    const loginScreen = screens.find(s => s.name.toLowerCase().includes('login'));
    const registerScreen = screens.find(s => s.name.toLowerCase().includes('register') || s.name.toLowerCase().includes('signup'));
    const onboardingScreen = screens.find(s => s.type === ScreenType.ONBOARDING);
    const dashboardScreen = screens.find(s => s.type === ScreenType.DASHBOARD || s.type === ScreenType.HOME);
    const listScreen = screens.find(s => s.type === ScreenType.LIST || s.type === ScreenType.GRID);
    const detailScreen = screens.find(s => s.type === ScreenType.DETAIL);
    const formScreen = screens.find(s => s.type === ScreenType.FORM);
    const profileScreen = screens.find(s => s.type === ScreenType.PROFILE);

    // Create complete user journey transitions for modern app flow
    
    // Launch to auth flows (if auth is required)
    if (launchScreen && authScreens.length > 0) {
      authScreens.forEach(authScreen => {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: launchScreen.id,
          to: authScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: authScreen.name.toLowerCase().includes('login') ? 'User chooses login' : 'User chooses sign up'
        });
      });
    }
    
    // Launch to onboarding (if no auth required)
    if (launchScreen && onboardingScreen && authScreens.length === 0) {
      transitions.push({
        id: `transition_${transitionIndex++}`,
        from: launchScreen.id,
        to: onboardingScreen.id,
        trigger: TransitionTrigger.USER_ACTION,
        description: 'App launches and starts onboarding'
      });
    }

    // Auth to onboarding flows (if onboarding exists)
    if (onboardingScreen) {
      authScreens.forEach(authScreen => {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: authScreen.id,
          to: onboardingScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'User completes authentication and starts onboarding'
        });
      });
    }

    // Onboarding to dashboard
    if (onboardingScreen && dashboardScreen) {
      transitions.push({
        id: `transition_${transitionIndex++}`,
        from: onboardingScreen.id,
        to: dashboardScreen.id,
        trigger: TransitionTrigger.USER_ACTION,
        description: 'User completes onboarding'
      });
    }

    // Auth to dashboard flows (direct, if no onboarding)
    if (dashboardScreen && !onboardingScreen) {
      authScreens.forEach(authScreen => {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: authScreen.id,
          to: dashboardScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'User completes authentication'
        });
      });
    }

    // Dashboard to main features
    if (dashboardScreen) {
      if (listScreen) {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: dashboardScreen.id,
          to: listScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'User navigates to items list'
        });
      }
      
      if (profileScreen) {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: dashboardScreen.id,
          to: profileScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'User navigates to profile'
        });
      }
    }

    // Essential CRUD flow - focus on forward actions only
    if (listScreen) {
      // List to detail (view action)
      if (detailScreen) {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: listScreen.id,
          to: detailScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'User clicks on list item'
        });
      }
      
      // List to form (add new action)
      if (formScreen) {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: listScreen.id,
          to: formScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'User clicks add new item'
        });
      }
    }

    // Skip return arrows - they create visual clutter and are implied
    // Users understand they can navigate back via UI controls

    return transitions;
  }

  // Helper methods for normalization
  private static normalizeScreenType(type: string): ScreenType {
    const typeMap: Record<string, ScreenType> = {
      // Authentication & Access
      'auth': ScreenType.AUTH,
      'onboarding': ScreenType.ONBOARDING,
      'verification': ScreenType.VERIFICATION,
      
      // Core App Screens
      'dashboard': ScreenType.DASHBOARD,
      'home': ScreenType.HOME,
      
      // Data & Content
      'list': ScreenType.LIST,
      'grid': ScreenType.GRID,
      'detail': ScreenType.DETAIL,
      'form': ScreenType.FORM,
      'search': ScreenType.SEARCH,
      'filter': ScreenType.FILTER,
      
      // User Management
      'profile': ScreenType.PROFILE,
      'settings': ScreenType.SETTINGS,
      'preferences': ScreenType.PREFERENCES,
      'account': ScreenType.ACCOUNT,
      
      // Communication & Social
      'chat': ScreenType.CHAT,
      'notifications': ScreenType.NOTIFICATIONS,
      'feed': ScreenType.FEED,
      
      // Commerce & Transactions
      'cart': ScreenType.CART,
      'checkout': ScreenType.CHECKOUT,
      'payment': ScreenType.PAYMENT,
      'order_history': ScreenType.ORDER_HISTORY,
      
      // Media & Content
      'gallery': ScreenType.GALLERY,
      'camera': ScreenType.CAMERA,
      'media_viewer': ScreenType.MEDIA_VIEWER,
      
      // Navigation & Structure
      'tab_bar': ScreenType.TAB_BAR,
      'drawer': ScreenType.DRAWER,
      'modal': ScreenType.MODAL,
      'bottom_sheet': ScreenType.BOTTOM_SHEET,
      
      // System & Utility
      'error': ScreenType.ERROR,
      'loading': ScreenType.LOADING,
      'empty_state': ScreenType.EMPTY_STATE,
      'tutorial': ScreenType.TUTORIAL,
      'help': ScreenType.HELP,
      
      // Advanced Features
      'map': ScreenType.MAP,
      'calendar': ScreenType.CALENDAR,
      'analytics': ScreenType.ANALYTICS,
      'reports': ScreenType.REPORTS
    };
    return typeMap[type?.toLowerCase()] || ScreenType.HOME;
  }

  private static normalizeHttpMethod(method: string): HttpMethod {
    const methodMap: Record<string, HttpMethod> = {
      'GET': HttpMethod.GET,
      'POST': HttpMethod.POST,
      'PUT': HttpMethod.PUT,
      'DELETE': HttpMethod.DELETE,
      'PATCH': HttpMethod.PATCH
    };
    return methodMap[method?.toUpperCase()] || HttpMethod.GET;
  }

  private static normalizeTransitionTrigger(trigger: string): TransitionTrigger {
    const triggerMap: Record<string, TransitionTrigger> = {
      'user_action': TransitionTrigger.USER_ACTION,
      'api_success': TransitionTrigger.API_SUCCESS,
      'api_error': TransitionTrigger.API_ERROR,
      'timer': TransitionTrigger.TIMER,
      'condition': TransitionTrigger.CONDITION,
      'navigation': TransitionTrigger.NAVIGATION
    };
    return triggerMap[trigger?.toLowerCase()] || TransitionTrigger.USER_ACTION;
  }

  private static normalizeComplexity(complexity: string): ComplexityLevel {
    const complexityMap: Record<string, ComplexityLevel> = {
      'simple': ComplexityLevel.SIMPLE,
      'moderate': ComplexityLevel.MODERATE,
      'complex': ComplexityLevel.COMPLEX
    };
    return complexityMap[complexity?.toLowerCase()] || ComplexityLevel.SIMPLE;
  }

  private static normalizeNavigationPattern(pattern: string): NavigationPattern {
    const patternMap: Record<string, NavigationPattern> = {
      'tab_based': NavigationPattern.TAB_BASED,
      'drawer': NavigationPattern.DRAWER,
      'stack': NavigationPattern.STACK,
      'modal': NavigationPattern.MODAL,
      'bottom_sheet': NavigationPattern.BOTTOM_SHEET,
      'wizard': NavigationPattern.WIZARD,
      'master_detail': NavigationPattern.MASTER_DETAIL,
      'card_stack': NavigationPattern.CARD_STACK
    };
    return patternMap[pattern?.toLowerCase()] || NavigationPattern.STACK;
  }
}
