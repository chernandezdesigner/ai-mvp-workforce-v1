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
      // Clean response of markdown code blocks and whitespace
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[\s\n]*/, '')
        .replace(/[\s\n]*$/, '');
      
      console.log('Cleaned AI response:', cleanResponse.substring(0, 200) + '...');
      const parsed = JSON.parse(cleanResponse);
      return this.validateAndNormalizeArchitecture(parsed, goal);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response.substring(0, 500));
      throw new Error('AI returned invalid JSON');
    }
  }

  /**
   * Build the AI prompt for architecture generation
   */
  private static buildArchitecturePrompt(goal: string): string {
    return `You are Marcus Rodriguez, Lead Product Designer at Stripe with 15+ years designing user flows for apps used by millions. You've designed for DoorDash, Spotify, and Figma. You understand what makes apps truly usable vs just pretty.

USER REQUEST: "${goal}"

METHODOLOGY: Follow the Jobs-to-be-Done framework
1. IDENTIFY THE JOB: What job is the user "hiring" this app to do?
2. MAP THE JOURNEY: Complete path from awareness to task completion
3. DESIGN FOR SUCCESS: Each screen moves user closer to their goal
4. REMOVE FRICTION: Eliminate unnecessary steps and cognitive load

MOBILE APP ARCHITECTURE PRINCIPLES:
🎯 FOCUS: One primary action per screen
📱 MOBILE-FIRST: Thumb-friendly, one-handed use
⚡ FAST: 2-3 taps to core value
🧠 SIMPLE: Reduce cognitive load at every step
🔄 CONNECTED: Every screen has clear entry/exit paths
♿ ACCESSIBLE: Works for everyone, all abilities

REQUIRED FLOW STRUCTURE:
Generate exactly 10-12 screens that follow this pattern:

1. ENTRY (1-2 screens)
   - Welcome/Splash
   - Authentication (if needed)

2. SETUP (1-2 screens)  
   - Onboarding/Permissions
   - Initial configuration

3. CORE VALUE (6-8 screens)
   - Home/Dashboard
   - Primary task screens
   - Detail/Action screens
   - Confirmation/Success

4. SUPPORTING (2-3 screens)
   - Profile/Settings  
   - Help/Support

TRANSITION REQUIREMENTS:
Every screen transition must be:
- Triggered by specific user action
- Motivated by clear user intent  
- Connected to user's main goal
- Recoverable (user can go back)

COMPONENT SPECIFICATION:
For each screen, specify 4-8 concrete UI components:
✅ "Search Bar with Voice Input" 
✅ "Restaurant Cards with Photos and Ratings"
❌ "Content Area" or "UI Elements" (too vague)

Return ONLY this JSON structure with NO additional text:

{
  "appName": "string - descriptive app name",
  "description": "string - value proposition in one sentence", 
  "complexity": "simple|moderate|complex",
  "tags": ["relevant", "domain", "keywords"],
  "screens": [
    {
      "name": "exact screen title",
      "type": "home|auth|onboarding|list|detail|form|profile|settings|cart|checkout|search",
      "description": "what user accomplishes here",
      "components": ["Specific UI Component Name", "Another Component", "Clear Button Labels"],
      "requiresAuth": true/false,
      "userIntent": "clear goal user has on this screen"
    }
  ],
  "transitions": [
    {
      "from": "exact screen name",
      "to": "exact screen name", 
      "trigger": "user_action",
      "description": "specific action like 'taps Sign In button'"
    }
  ]
}

CRITICAL: Create complete user journey from app launch to task completion. Every screen must connect logically. Use specific component names, not generic terms.`;
  }

  /**
   * Ensure all screens are connected in a logical flow
   */
  private static ensureConnectedFlow(screens: Screen[], existingTransitions: Transition[]): Transition[] {
    const transitions = [...existingTransitions];
    const connectedScreenIds = new Set<string>();
    
    // Track which screens are already connected
    existingTransitions.forEach(t => {
      connectedScreenIds.add(t.from);
      connectedScreenIds.add(t.to);
    });
    
    // Find unconnected screens
    const unconnectedScreens = screens.filter(s => !connectedScreenIds.has(s.id));
    
    // Create basic linear flow for unconnected screens
    if (unconnectedScreens.length > 0) {
      // Connect to the first connected screen if available, otherwise create a chain
      const firstConnectedScreen = screens.find(s => connectedScreenIds.has(s.id));
      let previousScreenId = firstConnectedScreen?.id || screens[0]?.id;
      
      unconnectedScreens.forEach((screen, index) => {
        if (previousScreenId && previousScreenId !== screen.id) {
          transitions.push({
            id: `fallback_transition_${transitions.length}`,
            from: previousScreenId,
            to: screen.id,
            trigger: TransitionTrigger.USER_ACTION,
            description: `Navigate to ${screen.name}`,
            condition: undefined
          });
        }
        previousScreenId = screen.id;
      });
    }
    
    return transitions;
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

    // Normalize transitions with enhanced context and validation
    let transitions: Transition[] = (parsed.transitions || []).map((transition: any, index: number) => {
      const fromScreen = screens.find(s => s.name === transition.from);
      const toScreen = screens.find(s => s.name === transition.to);
      
      // Skip invalid transitions
      if (!fromScreen || !toScreen) {
        console.warn(`Invalid transition: ${transition.from} -> ${transition.to}`);
        return null;
      }
      
      return {
        id: `transition_${index}`,
        from: fromScreen.id,
        to: toScreen.id,
        trigger: this.normalizeTransitionTrigger(transition.trigger || 'user_action'),
        description: transition.description || 'User navigates',
        condition: transition.userMotivation
      };
    }).filter(Boolean) as Transition[];

    // Ensure minimum connectivity - if we have disconnected screens, create basic flow
    if (transitions.length < screens.length - 1) {
      console.log('Adding missing transitions to ensure connectivity');
      transitions = this.ensureConnectedFlow(screens, transitions);
    }

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
    const lowerGoal = goal.toLowerCase();
    
    // Advanced app pattern recognition
    const appPatterns = {
      foodDelivery: lowerGoal.includes('food') || lowerGoal.includes('deliver') || lowerGoal.includes('restaurant') || lowerGoal.includes('order') || lowerGoal.includes('meal'),
      ecommerce: lowerGoal.includes('ecommerce') || lowerGoal.includes('shop') || lowerGoal.includes('buy') || lowerGoal.includes('sell') || lowerGoal.includes('product') || lowerGoal.includes('cart'),
      social: lowerGoal.includes('social') || lowerGoal.includes('chat') || lowerGoal.includes('message') || lowerGoal.includes('friend') || lowerGoal.includes('post'),
      productivity: lowerGoal.includes('todo') || lowerGoal.includes('task') || lowerGoal.includes('project') || lowerGoal.includes('manage') || lowerGoal.includes('organize'),
      fitness: lowerGoal.includes('fitness') || lowerGoal.includes('workout') || lowerGoal.includes('exercise') || lowerGoal.includes('health') || lowerGoal.includes('track'),
      finance: lowerGoal.includes('bank') || lowerGoal.includes('money') || lowerGoal.includes('payment') || lowerGoal.includes('budget') || lowerGoal.includes('expense'),
      travel: lowerGoal.includes('travel') || lowerGoal.includes('trip') || lowerGoal.includes('hotel') || lowerGoal.includes('flight') || lowerGoal.includes('booking'),
      education: lowerGoal.includes('learn') || lowerGoal.includes('course') || lowerGoal.includes('study') || lowerGoal.includes('education') || lowerGoal.includes('quiz'),
      entertainment: lowerGoal.includes('music') || lowerGoal.includes('video') || lowerGoal.includes('stream') || lowerGoal.includes('game') || lowerGoal.includes('entertainment'),
      news: lowerGoal.includes('news') || lowerGoal.includes('article') || lowerGoal.includes('blog') || lowerGoal.includes('read') || lowerGoal.includes('content')
    };

    // Determine primary app type and complexity
    let appType = 'general';
    let appName = 'My App';
    let tags: string[] = [];
    let complexity = ComplexityLevel.COMPLEX; // Default to complex for better flows

    if (appPatterns.foodDelivery) {
      appType = 'foodDelivery';
      appName = 'Food Delivery App';
      tags = ['food', 'delivery', 'restaurants', 'orders'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.ecommerce) {
      appType = 'ecommerce';
      appName = 'E-commerce App';
      tags = ['ecommerce', 'shopping', 'products', 'payments'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.social) {
      appType = 'social';
      appName = 'Social App';
      tags = ['social', 'messaging', 'community', 'sharing'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.productivity) {
      appType = 'productivity';
      appName = 'Productivity App';
      tags = ['productivity', 'tasks', 'organization', 'workflow'];
      complexity = ComplexityLevel.MODERATE;
    } else if (appPatterns.fitness) {
      appType = 'fitness';
      appName = 'Fitness App';
      tags = ['fitness', 'health', 'tracking', 'workouts'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.finance) {
      appType = 'finance';
      appName = 'Finance App';
      tags = ['finance', 'banking', 'payments', 'budget'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.travel) {
      appType = 'travel';
      appName = 'Travel App';
      tags = ['travel', 'booking', 'trips', 'hotels'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.education) {
      appType = 'education';
      appName = 'Learning App';
      tags = ['education', 'learning', 'courses', 'knowledge'];
      complexity = ComplexityLevel.MODERATE;
    } else if (appPatterns.entertainment) {
      appType = 'entertainment';
      appName = 'Entertainment App';
      tags = ['entertainment', 'media', 'streaming', 'content'];
      complexity = ComplexityLevel.COMPLEX;
    } else if (appPatterns.news) {
      appType = 'news';
      appName = 'News App';
      tags = ['news', 'articles', 'content', 'reading'];
      complexity = ComplexityLevel.MODERATE;
    }

    // Enhanced feature detection
    const features = {
      hasAuth: true, // Most modern apps require auth
      hasOnboarding: true, // Essential for good UX
      hasDashboard: appType !== 'productivity', // Most apps except simple task apps
      hasList: true, // Most apps have lists of content
      hasDetail: true, // Detail views are standard
      hasForm: true, // Forms for input/creation
      hasProfile: true, // User profiles are standard
      hasSettings: true, // Settings are expected
      hasSearch: appType === 'ecommerce' || appType === 'foodDelivery' || appType === 'news' || appType === 'entertainment',
      hasCart: appType === 'ecommerce' || appType === 'foodDelivery',
      hasPayment: appType === 'ecommerce' || appType === 'foodDelivery' || appType === 'travel',
      hasMap: appType === 'foodDelivery' || appType === 'travel',
      hasChat: appType === 'social' || appType === 'ecommerce' || appType === 'foodDelivery',
      hasNotifications: true, // Standard for engagement
      hasFeed: appType === 'social' || appType === 'news' || appType === 'entertainment',
      hasBooking: appType === 'travel' || appType === 'fitness',
      hasTracking: appType === 'fitness' || appType === 'foodDelivery' || appType === 'travel'
    };

    return {
      appType,
      appName,
      tags,
      complexity,
      features,
      originalGoal: goal
    };
  }

  private static generateScreens(analysis: any): Screen[] {
    const screens: Screen[] = [];
    let screenIndex = 0;

    // Generate screens based on app type with sophisticated flows
    if (analysis.appType === 'foodDelivery') {
      return this.generateFoodDeliveryScreens(analysis);
    } else if (analysis.appType === 'ecommerce') {
      return this.generateEcommerceScreens(analysis);
    } else if (analysis.appType === 'social') {
      return this.generateSocialScreens(analysis);
    } else if (analysis.appType === 'finance') {
      return this.generateFinanceScreens(analysis);
    } else if (analysis.appType === 'travel') {
      return this.generateTravelScreens(analysis);
    } else if (analysis.appType === 'fitness') {
      return this.generateFitnessScreens(analysis);
    } else {
      // Enhanced general app screens
      return this.generateGeneralAppScreens(analysis);
    }
  }

  private static generateFoodDeliveryScreens(analysis: any): Screen[] {
    return [
      {
        id: 'screen_0',
        name: 'Welcome Splash',
        type: ScreenType.LOADING,
        description: 'App launch screen with branding and location request',
        components: ['App Logo', 'Location Permission Request', 'Loading Animation'],
        data: { 
          requiresAuth: false,
          userJourney: {
            userIntent: 'Launch app and discover food options nearby',
            emotionalState: 'excited',
            cognitiveLoad: 'low',
            contextOfUse: 'mobile',
            userType: 'new'
          }
        }
      },
      {
        id: 'screen_1',
        name: 'Onboarding',
        type: ScreenType.ONBOARDING,
        description: 'Introduction to app features: browse restaurants, track orders, save favorites',
        components: ['Feature Carousel', 'Skip Button', 'Get Started Button', 'Progress Indicators'],
        data: { 
          requiresAuth: false,
          userJourney: {
            userIntent: 'Understand app value and main features',
            emotionalState: 'curious',
            cognitiveLoad: 'medium',
            contextOfUse: 'mobile',
            userType: 'new'
          }
        }
      },
      {
        id: 'screen_2',
        name: 'Sign Up',
        type: ScreenType.AUTH,
        description: 'User registration with email, phone verification',
        components: ['Phone Number Input', 'Email Input', 'Terms Checkbox', 'Continue Button', 'Login Link'],
        data: { 
          requiresAuth: false,
          formFields: [
            { name: 'phone', type: 'tel', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'firstName', type: 'text', required: true }
          ]
        }
      },
      {
        id: 'screen_3',
        name: 'Phone Verification',
        type: ScreenType.VERIFICATION,
        description: 'SMS code verification for account security',
        components: ['Code Input Fields', 'Resend Code Button', 'Verify Button', 'Edit Phone Link'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_4',
        name: 'Delivery Address',
        type: ScreenType.FORM,
        description: 'Set primary delivery address with map integration',
        components: ['Address Search Bar', 'Map View', 'Current Location Button', 'Address Details Form', 'Save Address Button'],
        data: { 
          requiresAuth: true,
          formFields: [
            { name: 'street', type: 'text', required: true },
            { name: 'apartment', type: 'text', required: false },
            { name: 'city', type: 'text', required: true },
            { name: 'instructions', type: 'textarea', required: false }
          ]
        }
      },
      {
        id: 'screen_5',
        name: 'Restaurant Discovery',
        type: ScreenType.HOME,
        description: 'Main home screen with restaurant categories, deals, and personalized recommendations',
        components: ['Search Bar', 'Cuisine Filter Chips', 'Featured Restaurants Carousel', 'Nearby Restaurants List', 'Deals Banner', 'Quick Reorder Section'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_6',
        name: 'Restaurant Search',
        type: ScreenType.SEARCH,
        description: 'Advanced search with filters for cuisine, price, delivery time, ratings',
        components: ['Search Input', 'Filter Panel', 'Sort Options', 'Restaurant Grid', 'Map Toggle', 'Clear Filters'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_7',
        name: 'Restaurant Detail',
        type: ScreenType.DETAIL,
        description: 'Restaurant page with menu, reviews, delivery info, and photos',
        components: ['Restaurant Header', 'Photo Gallery', 'Rating & Reviews', 'Menu Categories', 'Menu Items List', 'Add to Cart Buttons', 'Restaurant Info'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_8',
        name: 'Menu Item Detail',
        type: ScreenType.DETAIL,
        description: 'Individual menu item with customization options',
        components: ['Item Photo', 'Item Description', 'Customization Options', 'Size Selection', 'Add-ons Checkboxes', 'Special Instructions', 'Add to Cart Button'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_9',
        name: 'Shopping Cart',
        type: ScreenType.CART,
        description: 'Review order, modify quantities, apply promo codes',
        components: ['Cart Items List', 'Quantity Controls', 'Remove Item Buttons', 'Promo Code Input', 'Delivery Fee Breakdown', 'Checkout Button'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_10',
        name: 'Checkout',
        type: ScreenType.CHECKOUT,
        description: 'Delivery details, payment method, and order confirmation',
        components: ['Delivery Address Card', 'Delivery Time Selector', 'Payment Methods', 'Tip Calculator', 'Order Summary', 'Place Order Button'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_11',
        name: 'Order Confirmation',
        type: ScreenType.DETAIL,
        description: 'Order success with estimated delivery time and tracking info',
        components: ['Success Animation', 'Order Number', 'Estimated Time', 'Restaurant Info', 'Track Order Button', 'Order Again Button'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_12',
        name: 'Order Tracking',
        type: ScreenType.MAP,
        description: 'Real-time order tracking with map and status updates',
        components: ['Live Map', 'Delivery Progress Steps', 'Driver Info Card', 'Estimated Arrival', 'Call Driver Button', 'Order Details'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_13',
        name: 'Order History',
        type: ScreenType.LIST,
        description: 'Past orders with reorder and review options',
        components: ['Order History List', 'Order Status Badges', 'Reorder Buttons', 'Rate Order', 'Search Orders', 'Filter by Date'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_14',
        name: 'User Profile',
        type: ScreenType.PROFILE,
        description: 'Account management, saved addresses, payment methods',
        components: ['Profile Photo', 'Personal Info Form', 'Saved Addresses List', 'Payment Methods', 'Preferences Settings', 'Logout Button'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_15',
        name: 'Favorites',
        type: ScreenType.LIST,
        description: 'Saved restaurants and frequently ordered items',
        components: ['Favorite Restaurants', 'Favorite Items', 'Quick Reorder Options', 'Remove from Favorites', 'Share Favorites'],
        data: { requiresAuth: true }
      }
    ];
  }

  private static generateEcommerceScreens(analysis: any): Screen[] {
    return [
      {
        id: 'screen_0',
        name: 'Welcome',
        type: ScreenType.ONBOARDING,
        description: 'App introduction and feature highlights',
        components: ['Welcome Message', 'Feature Showcase', 'Get Started Button'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_1',
        name: 'Product Discovery',
        type: ScreenType.HOME,
        description: 'Main shopping interface with categories, deals, and recommendations',
        components: ['Search Bar', 'Category Grid', 'Featured Products', 'Daily Deals', 'Recommended for You'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_2',
        name: 'Product Search',
        type: ScreenType.SEARCH,
        description: 'Product search with advanced filtering',
        components: ['Search Input', 'Filter Panel', 'Sort Options', 'Product Grid', 'Search Suggestions'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_3',
        name: 'Product Details',
        type: ScreenType.DETAIL,
        description: 'Individual product page with photos, reviews, and purchase options',
        components: ['Product Image Gallery', 'Product Info', 'Size/Color Selection', 'Add to Cart', 'Reviews Section', 'Related Products'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_4',
        name: 'Shopping Cart',
        type: ScreenType.CART,
        description: 'Review cart items and proceed to checkout',
        components: ['Cart Items', 'Quantity Controls', 'Remove Items', 'Subtotal', 'Checkout Button'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_5',
        name: 'User Registration',
        type: ScreenType.AUTH,
        description: 'Account creation for checkout and order tracking',
        components: ['Registration Form', 'Social Login Options', 'Guest Checkout Option'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_6',
        name: 'Checkout',
        type: ScreenType.CHECKOUT,
        description: 'Shipping and payment information',
        components: ['Shipping Address', 'Payment Methods', 'Order Summary', 'Place Order'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_7',
        name: 'Order Confirmation',
        type: ScreenType.DETAIL,
        description: 'Order success and tracking information',
        components: ['Order Success', 'Order Details', 'Tracking Info', 'Continue Shopping'],
        data: { requiresAuth: true }
      }
    ];
  }

  private static generateSocialScreens(analysis: any): Screen[] {
    return [
      {
        id: 'screen_0',
        name: 'Welcome',
        type: ScreenType.ONBOARDING,
        description: 'App introduction and sign-up encouragement',
        components: ['Welcome Animation', 'App Features', 'Sign Up Button', 'Login Link'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_1',
        name: 'Sign Up',
        type: ScreenType.AUTH,
        description: 'New user registration',
        components: ['Profile Photo Upload', 'Username Input', 'Bio Input', 'Social Links'],
        data: { requiresAuth: false }
      },
      {
        id: 'screen_2',
        name: 'Friend Discovery',
        type: ScreenType.LIST,
        description: 'Find and connect with friends',
        components: ['Search Users', 'Suggested Friends', 'Contact Import', 'Follow Buttons'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_3',
        name: 'News Feed',
        type: ScreenType.FEED,
        description: 'Main social feed with posts from connections',
        components: ['Create Post Button', 'Story Carousel', 'Feed Posts', 'Like/Comment Actions', 'Share Options'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_4',
        name: 'Create Post',
        type: ScreenType.FORM,
        description: 'Create and share new content',
        components: ['Text Input', 'Photo/Video Upload', 'Location Tag', 'Audience Selector', 'Post Button'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_5',
        name: 'Messages',
        type: ScreenType.CHAT,
        description: 'Direct messaging interface',
        components: ['Chat List', 'New Message Button', 'Search Conversations', 'Unread Indicators'],
        data: { requiresAuth: true }
      },
      {
        id: 'screen_6',
        name: 'User Profile',
        type: ScreenType.PROFILE,
        description: 'User profile with posts and information',
        components: ['Profile Header', 'Post Grid', 'Bio Section', 'Follow/Unfollow Button', 'Message Button'],
        data: { requiresAuth: true }
      }
    ];
  }

  private static generateGeneralAppScreens(analysis: any): Screen[] {
    const screens: Screen[] = [];
    let screenIndex = 0;

    // Enhanced general flow with more screens
    screens.push({
      id: `screen_${screenIndex++}`,
      name: 'Welcome',
      type: ScreenType.ONBOARDING,
      description: 'App introduction and feature overview',
      components: ['Welcome Message', 'Feature Highlights', 'Get Started Button'],
      data: { requiresAuth: false }
    });

    if (analysis.features.hasAuth) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Sign Up',
        type: ScreenType.AUTH,
        description: 'User registration',
        components: ['Registration Form', 'Terms Agreement', 'Create Account Button'],
        data: { requiresAuth: false }
      });

      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Login',
        type: ScreenType.AUTH,
        description: 'User authentication',
        components: ['Login Form', 'Forgot Password Link', 'Sign Up Link'],
        data: { requiresAuth: false }
      });
    }

    if (analysis.features.hasDashboard) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Dashboard',
        type: ScreenType.DASHBOARD,
        description: 'Main app dashboard with overview and quick actions',
        components: ['Stats Overview', 'Quick Actions', 'Recent Activity', 'Navigation Menu'],
        data: { requiresAuth: analysis.features.hasAuth }
      });
    }

    screens.push({
      id: `screen_${screenIndex++}`,
      name: 'Main List',
      type: ScreenType.LIST,
      description: 'Primary content listing with search and filters',
      components: ['Search Bar', 'Filter Options', 'Content List', 'Add New Button'],
      data: { requiresAuth: analysis.features.hasAuth }
    });

    screens.push({
      id: `screen_${screenIndex++}`,
      name: 'Item Details',
      type: ScreenType.DETAIL,
      description: 'Detailed view of individual items',
      components: ['Item Header', 'Content Details', 'Action Buttons', 'Related Items'],
      data: { requiresAuth: analysis.features.hasAuth }
    });

    screens.push({
      id: `screen_${screenIndex++}`,
      name: 'Create/Edit',
      type: ScreenType.FORM,
      description: 'Form for creating or editing content',
      components: ['Input Form', 'Save Button', 'Cancel Button', 'Form Validation'],
      data: { requiresAuth: analysis.features.hasAuth }
    });

    if (analysis.features.hasProfile) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Profile',
        type: ScreenType.PROFILE,
        description: 'User profile management',
        components: ['Profile Info', 'Edit Profile', 'Account Settings', 'Activity History'],
        data: { requiresAuth: true }
      });
    }

    if (analysis.features.hasSettings) {
      screens.push({
        id: `screen_${screenIndex++}`,
        name: 'Settings',
        type: ScreenType.SETTINGS,
        description: 'App settings and preferences',
        components: ['General Settings', 'Privacy Settings', 'Notification Preferences', 'Account Management'],
        data: { requiresAuth: analysis.features.hasAuth }
      });
    }

    return screens;
  }

  // Additional specialized screen generators would go here for other app types
  private static generateFinanceScreens(analysis: any): Screen[] {
    // Implementation for finance app screens
    return this.generateGeneralAppScreens(analysis);
  }

  private static generateTravelScreens(analysis: any): Screen[] {
    // Implementation for travel app screens  
    return this.generateGeneralAppScreens(analysis);
  }

  private static generateFitnessScreens(analysis: any): Screen[] {
    // Implementation for fitness app screens
    return this.generateGeneralAppScreens(analysis);
  }

  // API endpoints removed - focusing only on UX flow in this phase

  private static generateTransitions(screens: Screen[], analysis: any): Transition[] {
    const transitions: Transition[] = [];
    let transitionIndex = 0;

    // Generate sophisticated transitions based on app type
    if (analysis.appType === 'foodDelivery') {
      return this.generateFoodDeliveryTransitions(screens);
    } else if (analysis.appType === 'ecommerce') {
      return this.generateEcommerceTransitions(screens);
    } else if (analysis.appType === 'social') {
      return this.generateSocialTransitions(screens);
    } else {
      return this.generateGeneralTransitions(screens, analysis);
    }
  }

  private static generateFoodDeliveryTransitions(screens: Screen[]): Transition[] {
    // Create logical flow for food delivery app
    return [
      // Launch Flow
      { id: 'transition_0', from: 'screen_0', to: 'screen_1', trigger: TransitionTrigger.USER_ACTION, description: 'App loads, show onboarding' },
      { id: 'transition_1', from: 'screen_1', to: 'screen_2', trigger: TransitionTrigger.USER_ACTION, description: 'User wants to sign up' },
      { id: 'transition_2', from: 'screen_2', to: 'screen_3', trigger: TransitionTrigger.USER_ACTION, description: 'User submits phone number' },
      { id: 'transition_3', from: 'screen_3', to: 'screen_4', trigger: TransitionTrigger.USER_ACTION, description: 'User verifies phone' },
      { id: 'transition_4', from: 'screen_4', to: 'screen_5', trigger: TransitionTrigger.USER_ACTION, description: 'User sets delivery address' },
      
      // Core App Flow
      { id: 'transition_5', from: 'screen_5', to: 'screen_6', trigger: TransitionTrigger.USER_ACTION, description: 'User searches restaurants' },
      { id: 'transition_6', from: 'screen_5', to: 'screen_7', trigger: TransitionTrigger.USER_ACTION, description: 'User selects restaurant' },
      { id: 'transition_7', from: 'screen_6', to: 'screen_7', trigger: TransitionTrigger.USER_ACTION, description: 'User selects restaurant from search' },
      { id: 'transition_8', from: 'screen_7', to: 'screen_8', trigger: TransitionTrigger.USER_ACTION, description: 'User views menu item' },
      { id: 'transition_9', from: 'screen_8', to: 'screen_9', trigger: TransitionTrigger.USER_ACTION, description: 'User adds item to cart' },
      
      // Checkout Flow
      { id: 'transition_10', from: 'screen_9', to: 'screen_10', trigger: TransitionTrigger.USER_ACTION, description: 'User proceeds to checkout' },
      { id: 'transition_11', from: 'screen_10', to: 'screen_11', trigger: TransitionTrigger.USER_ACTION, description: 'User places order' },
      { id: 'transition_12', from: 'screen_11', to: 'screen_12', trigger: TransitionTrigger.USER_ACTION, description: 'User tracks order' },
      
      // Secondary Flows
      { id: 'transition_13', from: 'screen_5', to: 'screen_13', trigger: TransitionTrigger.USER_ACTION, description: 'User views order history' },
      { id: 'transition_14', from: 'screen_5', to: 'screen_14', trigger: TransitionTrigger.USER_ACTION, description: 'User accesses profile' },
      { id: 'transition_15', from: 'screen_5', to: 'screen_15', trigger: TransitionTrigger.USER_ACTION, description: 'User views favorites' },
      
      // Reorder Flow
      { id: 'transition_16', from: 'screen_13', to: 'screen_9', trigger: TransitionTrigger.USER_ACTION, description: 'User reorders from history' },
      { id: 'transition_17', from: 'screen_15', to: 'screen_7', trigger: TransitionTrigger.USER_ACTION, description: 'User selects favorite restaurant' }
    ];
  }

  private static generateEcommerceTransitions(screens: Screen[]): Transition[] {
    return [
      // Discovery Flow
      { id: 'transition_0', from: 'screen_0', to: 'screen_1', trigger: TransitionTrigger.USER_ACTION, description: 'User starts shopping' },
      { id: 'transition_1', from: 'screen_1', to: 'screen_2', trigger: TransitionTrigger.USER_ACTION, description: 'User searches products' },
      { id: 'transition_2', from: 'screen_1', to: 'screen_3', trigger: TransitionTrigger.USER_ACTION, description: 'User views product' },
      { id: 'transition_3', from: 'screen_2', to: 'screen_3', trigger: TransitionTrigger.USER_ACTION, description: 'User selects product from search' },
      
      // Purchase Flow
      { id: 'transition_4', from: 'screen_3', to: 'screen_4', trigger: TransitionTrigger.USER_ACTION, description: 'User adds to cart' },
      { id: 'transition_5', from: 'screen_4', to: 'screen_5', trigger: TransitionTrigger.USER_ACTION, description: 'User needs account for checkout' },
      { id: 'transition_6', from: 'screen_5', to: 'screen_6', trigger: TransitionTrigger.USER_ACTION, description: 'User proceeds to checkout' },
      { id: 'transition_7', from: 'screen_6', to: 'screen_7', trigger: TransitionTrigger.USER_ACTION, description: 'User completes purchase' }
    ];
  }

  private static generateSocialTransitions(screens: Screen[]): Transition[] {
    return [
      // Onboarding Flow
      { id: 'transition_0', from: 'screen_0', to: 'screen_1', trigger: TransitionTrigger.USER_ACTION, description: 'User signs up' },
      { id: 'transition_1', from: 'screen_1', to: 'screen_2', trigger: TransitionTrigger.USER_ACTION, description: 'User discovers friends' },
      { id: 'transition_2', from: 'screen_2', to: 'screen_3', trigger: TransitionTrigger.USER_ACTION, description: 'User enters main feed' },
      
      // Core Social Flows
      { id: 'transition_3', from: 'screen_3', to: 'screen_4', trigger: TransitionTrigger.USER_ACTION, description: 'User creates post' },
      { id: 'transition_4', from: 'screen_3', to: 'screen_5', trigger: TransitionTrigger.USER_ACTION, description: 'User opens messages' },
      { id: 'transition_5', from: 'screen_3', to: 'screen_6', trigger: TransitionTrigger.USER_ACTION, description: 'User views profile' }
    ];
  }

  private static generateGeneralTransitions(screens: Screen[], analysis: any): Transition[] {
    const transitions: Transition[] = [];
    let transitionIndex = 0;

    // Create linear flow through screens
    for (let i = 0; i < screens.length - 1; i++) {
      transitions.push({
        id: `transition_${transitionIndex++}`,
        from: screens[i].id,
        to: screens[i + 1].id,
        trigger: TransitionTrigger.USER_ACTION,
        description: `Navigate from ${screens[i].name} to ${screens[i + 1].name}`
      });
    }

    // Add some strategic back-connections
    if (screens.length > 3) {
      // Connect detail back to list
      const listScreen = screens.find(s => s.type === ScreenType.LIST);
      const detailScreen = screens.find(s => s.type === ScreenType.DETAIL);
      if (listScreen && detailScreen) {
        transitions.push({
          id: `transition_${transitionIndex++}`,
          from: detailScreen.id,
          to: listScreen.id,
          trigger: TransitionTrigger.USER_ACTION,
          description: 'Return to list'
        });
      }
    }

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
