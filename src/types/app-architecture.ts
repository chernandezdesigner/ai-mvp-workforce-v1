export interface AppArchitecture {
  id: string;
  name: string;
  description: string;
  screens: Screen[];
  transitions: Transition[];
  apiEndpoints: ApiEndpoint[];
  metadata: AppMetadata;
}

export interface Screen {
  id: string;
  name: string;
  type: ScreenType;
  description: string;
  components: string[];
  data: ScreenData;
  position?: { x: number; y: number };
}

export interface Transition {
  id: string;
  from: string; // Screen ID
  to: string; // Screen ID
  trigger: TransitionTrigger;
  condition?: string;
  description: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  description: string;
  requestSchema?: Record<string, any>;
  responseSchema?: Record<string, any>;
  authentication: boolean;
  connectedScreens: string[]; // Screen IDs that use this endpoint
  position?: { x: number; y: number };
}

export interface AppMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  tags: string[];
  complexity: ComplexityLevel;
  estimatedScreens: number;
  estimatedApis: number;
}

export enum ScreenType {
  // Authentication & Access
  AUTH = 'auth',
  ONBOARDING = 'onboarding',
  VERIFICATION = 'verification',
  
  // Core App Screens
  DASHBOARD = 'dashboard',
  HOME = 'home',
  
  // Data & Content
  LIST = 'list',
  GRID = 'grid',
  DETAIL = 'detail',
  FORM = 'form',
  SEARCH = 'search',
  FILTER = 'filter',
  
  // User Management
  PROFILE = 'profile',
  SETTINGS = 'settings',
  PREFERENCES = 'preferences',
  ACCOUNT = 'account',
  
  // Communication & Social
  CHAT = 'chat',
  NOTIFICATIONS = 'notifications',
  FEED = 'feed',
  
  // Commerce & Transactions
  CART = 'cart',
  CHECKOUT = 'checkout',
  PAYMENT = 'payment',
  ORDER_HISTORY = 'order_history',
  
  // Media & Content
  GALLERY = 'gallery',
  CAMERA = 'camera',
  MEDIA_VIEWER = 'media_viewer',
  
  // Navigation & Structure
  TAB_BAR = 'tab_bar',
  DRAWER = 'drawer',
  MODAL = 'modal',
  BOTTOM_SHEET = 'bottom_sheet',
  
  // System & Utility
  ERROR = 'error',
  LOADING = 'loading',
  EMPTY_STATE = 'empty_state',
  TUTORIAL = 'tutorial',
  HELP = 'help',
  
  // Advanced Features
  MAP = 'map',
  CALENDAR = 'calendar',
  ANALYTICS = 'analytics',
  REPORTS = 'reports'
}

export enum TransitionTrigger {
  USER_ACTION = 'user_action',
  API_SUCCESS = 'api_success',
  API_ERROR = 'api_error',
  TIMER = 'timer',
  CONDITION = 'condition',
  NAVIGATION = 'navigation'
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex'
}

export interface ScreenData {
  requiresAuth: boolean;
  dataSource?: string; // API endpoint ID or data type
  formFields?: FormField[];
  listItems?: ListItemConfig;
  permissions?: string[];
  userJourney?: UserJourneyContext;
  accessibility?: AccessibilityRequirements;
  interactions?: InteractionPattern[];
  stateManagement?: StateRequirement[];
  navigationPattern?: NavigationPattern;
}

export interface FormField {
  name: string;
  type: string;
  required: boolean;
  validation?: string;
}

export interface ListItemConfig {
  itemType: string;
  displayFields: string[];
  actions: string[];
}

// Flow diagram node types for React Flow
export interface FlowNode {
  id: string;
  type: 'screen' | 'api' | 'start' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    screenType?: ScreenType;
    method?: HttpMethod;
    [key: string]: any;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    trigger: TransitionTrigger;
    condition?: string;
  };
}

export interface AppFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Enhanced UX-focused interfaces

export interface UserJourneyContext {
  userIntent: string; // What the user is trying to accomplish
  emotionalState: 'frustrated' | 'excited' | 'focused' | 'confused' | 'satisfied';
  cognitiveLoad: 'low' | 'medium' | 'high';
  contextOfUse: 'mobile' | 'desktop' | 'tablet' | 'multi-device';
  userType: 'new' | 'returning' | 'power' | 'admin';
}

export interface AccessibilityRequirements {
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  focusManagement: string[];
}

export interface InteractionPattern {
  type: 'tap' | 'swipe' | 'drag' | 'pinch' | 'long_press' | 'hover' | 'scroll';
  target: string; // Component or area
  feedback: 'visual' | 'haptic' | 'audio' | 'none';
  result: string; // What happens after interaction
}

export interface StateRequirement {
  stateName: string;
  trigger: string;
  visualChanges: string[];
  dataChanges?: string[];
}

export enum NavigationPattern {
  TAB_BASED = 'tab_based',
  DRAWER = 'drawer',
  STACK = 'stack',
  MODAL = 'modal',
  BOTTOM_SHEET = 'bottom_sheet',
  WIZARD = 'wizard',
  MASTER_DETAIL = 'master_detail',
  CARD_STACK = 'card_stack'
}

export enum UserFlowType {
  ONBOARDING = 'onboarding',
  TASK_COMPLETION = 'task_completion',
  DISCOVERY = 'discovery',
  AUTHENTICATION = 'authentication',
  TRANSACTION = 'transaction',
  CONTENT_CONSUMPTION = 'content_consumption',
  SOCIAL_INTERACTION = 'social_interaction',
  PRODUCTIVITY = 'productivity'
}

export enum InteractionComplexity {
  SIMPLE = 'simple', // Single action, immediate feedback
  MODERATE = 'moderate', // Multi-step, some cognitive load
  COMPLEX = 'complex' // Multi-step, high cognitive load, expert users
}

export interface UXPrinciple {
  principle: string;
  application: string;
  screenIds: string[];
}

// Enhanced app metadata with UX considerations
export interface EnhancedAppMetadata extends AppMetadata {
  primaryUserFlows: UserFlowType[];
  targetAudience: string[];
  deviceTargets: ('mobile' | 'tablet' | 'desktop')[];
  accessibilityLevel: 'basic' | 'enhanced' | 'full';
  uxPrinciples: UXPrinciple[];
  interactionComplexity: InteractionComplexity;
}

// Wireframe-specific types
export interface WireframeProject {
  id: string;
  name: string;
  description: string;
  sourceArchitecture?: AppArchitecture; // Link to flow diagram
  screens: WireframeScreen[];
  metadata: WireframeMetadata;
}

export interface WireframeScreen {
  id: string;
  name: string;
  type: ScreenType;
  device: DeviceType;
  description: string;
  components: WireframeComponent[];
  layout: LayoutConfig;
  position?: { x: number; y: number };
  sourceScreenId?: string; // Link back to flow diagram screen
}

export interface WireframeComponent {
  id: string;
  type: ComponentType;
  tag: string; // HTML tag (div, header, button, etc.)
  content?: string;
  placeholder?: string;
  styles: ComponentStyles;
  children: WireframeComponent[];
  props?: Record<string, any>;
  interactions?: ComponentInteraction[];
}

export interface ComponentStyles {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number;
  [key: string]: any;
}

export interface ComponentInteraction {
  trigger: 'click' | 'hover' | 'focus' | 'input' | 'scroll';
  action: string;
  target?: string;
  feedback?: 'visual' | 'haptic' | 'audio';
}

export interface LayoutConfig {
  type: 'stack' | 'grid' | 'flex' | 'absolute';
  direction?: 'row' | 'column';
  gap?: string;
  padding?: string;
  maxWidth?: string;
  responsive?: boolean;
}

export interface WireframeMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  device: DeviceType;
  viewport: ViewportSize;
  designSystem?: DesignSystemHint;
}

export enum ComponentType {
  // Layout Components
  CONTAINER = 'container',
  HEADER = 'header',
  FOOTER = 'footer',
  SIDEBAR = 'sidebar',
  MAIN_CONTENT = 'main_content',
  SECTION = 'section',
  
  // Navigation
  NAVBAR = 'navbar',
  BREADCRUMB = 'breadcrumb',
  TABS = 'tabs',
  PAGINATION = 'pagination',
  
  // Content
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  LIST_ITEM = 'list_item',
  IMAGE = 'image',
  VIDEO = 'video',
  
  // Forms
  FORM = 'form',
  INPUT = 'input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  BUTTON = 'button',
  SUBMIT_BUTTON = 'submit_button',
  
  // Data Display
  TABLE = 'table',
  CARD = 'card',
  BADGE = 'badge',
  AVATAR = 'avatar',
  PROGRESS_BAR = 'progress_bar',
  
  // Feedback
  ALERT = 'alert',
  TOAST = 'toast',
  MODAL = 'modal',
  LOADING_SPINNER = 'loading_spinner',
  
  // Interactive
  DROPDOWN = 'dropdown',
  TOOLTIP = 'tooltip',
  ACCORDION = 'accordion',
  CAROUSEL = 'carousel'
}

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet', 
  DESKTOP = 'desktop'
}

export interface ViewportSize {
  width: number;
  height: number;
}

export enum DesignSystemHint {
  SHADCN = 'shadcn',
  MATERIAL = 'material',
  IOS = 'ios',
  CUSTOM = 'custom'
}

// Wireframe Flow types
export interface WireframeFlow {
  nodes: WireframeFlowNode[];
  edges: FlowEdge[];
}

export interface WireframeFlowNode extends FlowNode {
  type: 'wireframe_screen';
  data: {
    label: string;
    screen: WireframeScreen;
    device: DeviceType;
    [key: string]: any;
  };
}
