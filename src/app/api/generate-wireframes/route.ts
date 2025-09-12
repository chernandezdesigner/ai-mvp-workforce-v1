import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/lib/ai-providers';
import { AppArchitecture, WireframeProject, WireframeScreen, WireframeComponent, ComponentType, DeviceType, LayoutConfig } from '@/types/app-architecture';

export async function POST(request: NextRequest) {
  try {
    const { architecture, device = DeviceType.MOBILE, designHints } = await request.json();

    if (!architecture) {
      return NextResponse.json({ error: 'Architecture data is required' }, { status: 400 });
    }

    const aiService = createAIService();

    // Generate wireframes for each screen in the architecture
    const wireframeScreens: WireframeScreen[] = [];

    for (const screen of architecture.screens) {
      const wireframePrompt = createWireframePrompt(architecture, screen, device, designHints);
      
      try {
        const response = await aiService.generateText(wireframePrompt);
        const wireframeData = parseWireframeResponse(response);
        
        const wireframeScreen: WireframeScreen = {
          id: screen.id,
          name: screen.name,
          type: screen.type,
          device,
          description: screen.description,
          components: wireframeData.components,
          layout: wireframeData.layout,
          sourceScreenId: screen.id,
        };

        wireframeScreens.push(wireframeScreen);
      } catch (error) {
        console.error(`Failed to generate wireframe for screen ${screen.name}:`, error);
        // Create a fallback wireframe
        wireframeScreens.push(createFallbackWireframe(screen, device));
      }
    }

    const wireframeProject: WireframeProject = {
      id: `wireframe-${architecture.id}`,
      name: `${architecture.name} Wireframes`,
      description: `Wireframe designs for ${architecture.name}`,
      sourceArchitecture: architecture,
      screens: wireframeScreens,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        device,
        viewport: getDeviceViewport(device),
      },
    };

    return NextResponse.json({ wireframes: wireframeProject });
  } catch (error) {
    console.error('Wireframe generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate wireframes' },
      { status: 500 }
    );
  }
}

function createWireframePrompt(architecture: AppArchitecture, screen: any, device: DeviceType, designHints?: string): string {
  const deviceContext = getDeviceContext(device);
  
  return `You are Elena Vasquez, Senior UI Designer at Netflix with 12+ years creating pixel-perfect interfaces. You've designed the UI for apps like Instagram, Notion, and Linear. You excel at creating wireframes that translate directly to beautiful production code.

TARGET SCREEN: ${screen.name} (${screen.type})
APP CONTEXT: ${architecture.name} - ${screen.description}
DEVICE: ${device} ${deviceContext}
MENTIONED COMPONENTS: ${screen.components?.join(', ') || 'None specified'}
${designHints ? `DESIGN DIRECTION: ${designHints}` : ''}

UX LAWS & DESIGN PRINCIPLES:
Apply these fundamental UX laws to create intuitive interfaces:

🎨 AESTHETIC-USABILITY EFFECT: Beautiful designs feel more usable
   - Use consistent visual styling, proper alignment, pleasing proportions
   - Clean layouts with thoughtful whitespace increase perceived functionality

🧠 COGNITIVE LOAD THEORY: Minimize mental effort required
   - Reduce unnecessary UI elements, use familiar patterns
   - Progressive disclosure: show only what's needed for current task

⚖️ HICK'S LAW: More choices = longer decision time  
   - Limit options per screen (7±2 rule), use clear categorization
   - Primary action should be obvious, secondary actions de-emphasized

📚 CHUNKING: Group related information together
   - Organize content in logical sections with clear visual separations
   - Use cards, sections, and spacing to create meaningful information groups

🔢 MILLER'S LAW: 7±2 items in working memory
   - Navigation menus max 7 items, form fields in logical groups
   - Break complex processes into smaller, manageable steps

🥇 SERIAL POSITION EFFECT: Remember first and last items best
   - Place most important actions at top and bottom of screens
   - Critical information should lead or conclude content sections

🌐 JAKOB'S LAW: Follow established conventions
   - Use standard interaction patterns (tap, swipe, pinch)
   - Navigation placement follows platform conventions (iOS/Android/Web)

✂️ OCCAM'S RAZOR: Simplest solution is usually best
   - Eliminate unnecessary steps, combine related functions
   - One primary action per screen, clear single-purpose interfaces

TECHNICAL SPECIFICATIONS:
📏 SPACING SYSTEM: 4px, 8px, 12px, 16px, 24px, 32px, 48px grid
🎯 ACCESSIBILITY: WCAG AA compliance, 44px minimum touch targets
📱 DEVICE OPTIMIZATION: ${device === 'mobile' ? 'Thumb-friendly zones, safe areas' : device === 'tablet' ? 'Two-column layouts, landscape consideration' : 'Rich information density, mouse interactions'}
🔤 TYPOGRAPHY: Clear hierarchy (32px, 24px, 18px, 16px, 14px, 12px)
🎨 COLOR SYSTEM: Primary, secondary, neutral grays, semantic colors

WIREFRAME FIDELITY LEVEL: High-fidelity structural wireframe
- Show exact component placement and sizing
- Include realistic content and copy
- Specify interactive elements clearly
- Design for actual user tasks, not just UI components

${device.toUpperCase()} DESIGN PATTERNS:
${device === 'mobile' ? `
- Thumb zone optimization (bottom 1/3 of screen)
- Swipe gestures for navigation
- Collapsible headers to save space
- Bottom sheet modals for secondary actions
- Tab bars for primary navigation (max 5 tabs)` : device === 'tablet' ? `
- Two-column layouts when appropriate
- Sidebar navigation for complex apps
- Popover menus and modals
- Split-view for master/detail screens
- Landscape/portrait considerations` : `
- Rich data tables and complex layouts
- Hover states and mouse interactions
- Keyboard shortcuts and accessibility
- Multi-column information display
- Breadcrumb navigation for deep hierarchies`}

UX LAW APPLICATION BY SCREEN TYPE:

FOR LIST SCREENS (${screen.type === 'list' ? 'CURRENT SCREEN' : 'Reference'}):
- CHUNKING: Group similar items, use consistent card patterns
- SERIAL POSITION: Most important items at top, key actions at bottom
- MILLER'S LAW: Show 5-7 items per screen, infinite scroll or pagination

FOR FORM SCREENS (${screen.type === 'form' ? 'CURRENT SCREEN' : 'Reference'}):
- COGNITIVE LOAD: One concept per field, clear labels and validation
- CHUNKING: Related fields grouped together with visual separations
- HICK'S LAW: Minimize form fields, use smart defaults and progressive disclosure

FOR DETAIL SCREENS (${screen.type === 'detail' ? 'CURRENT SCREEN' : 'Reference'}):
- AESTHETIC-USABILITY: Rich media and clean typography enhance trust
- CHUNKING: Information organized in scannable sections (Overview, Details, Actions)
- SERIAL POSITION: Key info at top, primary actions at bottom

FOR HOME/DASHBOARD (${screen.type === 'home' || screen.type === 'dashboard' ? 'CURRENT SCREEN' : 'Reference'}):
- HICK'S LAW: 3-5 primary actions maximum, clear visual hierarchy
- JAKOB'S LAW: Follow platform patterns for navigation and layout
- COGNITIVE LOAD: Personalized content reduces decision fatigue

COMPONENT HIERARCHY RULES:
1. LAYOUT CONTAINERS: Establish structure first (apply CHUNKING)
2. NAVIGATION: Header/tabs/breadcrumbs (follow JAKOB'S LAW)
3. CONTENT: Primary information (minimize COGNITIVE LOAD)
4. SECONDARY: Supporting info (apply SERIAL POSITION EFFECT)
5. SYSTEM: Loading states, errors, empty states (maintain AESTHETIC-USABILITY)

Generate HTML/CSS wireframe structure. Return ONLY this JSON:

{
  "layout": {
    "type": "flex",
    "direction": "column",
    "gap": "0px",
    "padding": "0px",
    "maxWidth": "${device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '1200px'}"
  },
  "components": [
    {
      "id": "unique-component-id",
      "type": "container|header|navbar|heading|paragraph|button|input|form|card|list|image|etc",
      "tag": "div|header|h1|p|button|input|form|section|etc",
      "content": "Realistic text content or null",
      "placeholder": "Input placeholder text or null",
      "styles": {
        "display": "flex|block|grid",
        "flexDirection": "row|column",
        "justifyContent": "flex-start|center|space-between|etc",
        "alignItems": "flex-start|center|stretch|etc",
        "gap": "16px",
        "padding": "16px",
        "margin": "0px",
        "width": "100%",
        "height": "auto|specific value",
        "backgroundColor": "#ffffff|#f8f9fa|transparent",
        "border": "1px solid #e0e0e0|none",
        "borderRadius": "8px|0px",
        "fontSize": "16px|14px|18px|etc",
        "fontWeight": "400|500|600",
        "color": "#000000|#666666|#333333",
        "textAlign": "left|center|right"
      },
      "children": []
    }
  ]
}

CRITICAL: Create production-ready wireframe with specific measurements, realistic content, and clear interaction affordances.`;
}

function parseWireframeResponse(response: string): { components: WireframeComponent[], layout: LayoutConfig } {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    return {
      components: parsedResponse.components.map((comp: any) => convertToWireframeComponent(comp)),
      layout: parsedResponse.layout || {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        padding: '20px',
      },
    };
  } catch (error) {
    console.error('Failed to parse wireframe response:', error);
    throw error;
  }
}

function convertToWireframeComponent(comp: any): WireframeComponent {
  return {
    id: comp.id || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: mapToComponentType(comp.type),
    tag: comp.tag || 'div',
    content: comp.content,
    placeholder: comp.placeholder,
    styles: comp.styles || {},
    children: comp.children ? comp.children.map((child: any) => convertToWireframeComponent(child)) : [],
    props: comp.props,
    interactions: comp.interactions,
  };
}

function mapToComponentType(type: string): ComponentType {
  const typeMap: Record<string, ComponentType> = {
    'container': ComponentType.CONTAINER,
    'header': ComponentType.HEADER,
    'footer': ComponentType.FOOTER,
    'navbar': ComponentType.NAVBAR,
    'heading': ComponentType.HEADING,
    'paragraph': ComponentType.PARAGRAPH,
    'button': ComponentType.BUTTON,
    'submit_button': ComponentType.SUBMIT_BUTTON,
    'input': ComponentType.INPUT,
    'textarea': ComponentType.TEXTAREA,
    'form': ComponentType.FORM,
    'card': ComponentType.CARD,
    'list': ComponentType.LIST,
    'list_item': ComponentType.LIST_ITEM,
    'image': ComponentType.IMAGE,
    'badge': ComponentType.BADGE,
    'avatar': ComponentType.AVATAR,
    'tabs': ComponentType.TABS,
    'modal': ComponentType.MODAL,
    'loading_spinner': ComponentType.LOADING_SPINNER,
  };

  return typeMap[type] || ComponentType.CONTAINER;
}

function createFallbackWireframe(screen: any, device: DeviceType): WireframeScreen {
  const basicComponents: WireframeComponent[] = [
    {
      id: 'header-1',
      type: ComponentType.HEADER,
      tag: 'header',
      content: screen.name,
      styles: {
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        fontWeight: 'bold',
        fontSize: '18px',
      },
      children: [],
    },
    {
      id: 'main-content-1',
      type: ComponentType.CONTAINER,
      tag: 'main',
      styles: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '300px',
      },
      children: [
        {
          id: 'description-1',
          type: ComponentType.PARAGRAPH,
          tag: 'p',
          content: screen.description || 'This screen is part of your app flow.',
          styles: {
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.5',
          },
          children: [],
        },
      ],
    },
  ];

  return {
    id: screen.id,
    name: screen.name,
    type: screen.type,
    device,
    description: screen.description,
    components: basicComponents,
    layout: {
      type: 'flex',
      direction: 'column',
      gap: '0px',
      padding: '0px',
    },
    sourceScreenId: screen.id,
  };
}

function getDeviceContext(device: DeviceType): string {
  switch (device) {
    case DeviceType.MOBILE:
      return '(320-480px width, touch interface, portrait orientation)';
    case DeviceType.TABLET:
      return '(768-1024px width, touch interface, can rotate)';
    case DeviceType.DESKTOP:
      return '(1200px+ width, mouse/keyboard interface, landscape)';
    default:
      return '';
  }
}

function getDeviceViewport(device: DeviceType) {
  switch (device) {
    case DeviceType.MOBILE:
      return { width: 375, height: 667 };
    case DeviceType.TABLET:
      return { width: 768, height: 1024 };
    case DeviceType.DESKTOP:
      return { width: 1440, height: 900 };
    default:
      return { width: 375, height: 667 };
  }
}