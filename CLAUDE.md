# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
No specific test commands configured - check README for current testing approach.

## Project Architecture

This is an AI-powered multi-agent app studio that transforms app ideas into working codebases through specialized AI tools. The project has pivoted from a linear pipeline approach to a flexible multi-tool workspace where users can access different AI agents for specific tasks.

### Current Status & Strategic Direction

**Completed:** User flow diagramming tool (satisfactory milestone reached)

**Next Priority:** Wireframer tool with pipeline integration from flow diagrams

**Long-term Vision:** Multi-tool AI workspace with specialized agents:
- Flow Diagrams (✅ Complete)
- Wireframes (🚧 Next Phase)  
- Hi-fi Coded UI Designer
- UXR/Competitive Researcher
- Custom Component Builder
- Design System Application (Shadcn, Material, iOS)
- Frontend Scaffolding (React + Tailwind + Shadcn)
- Backend Setup (Supabase)
- GitHub Export/Sync

Each tool should be promptable and user-refinable for co-creation rather than full automation.

### Key Architecture Components

**Current Application Flow (Flow Diagramming Tool):**
1. User enters app idea description on landing page
2. AI analyzes and generates app architecture via `/api/generate-architecture`
3. Architecture converted to React Flow diagram
4. Real-time AI thinking process shown via `/api/ai-thinking`
5. Interactive flow diagram with drag-and-drop editing
6. Export to JSON for handoff to other tools

**Planned Multi-Tool Home Page:**
- Tool selection interface replacing current direct-to-flow approach
- Each tool maintains independent workflows while allowing data handoffs
- Cross-tool integration (e.g., Flow Diagrams → Wireframes pipeline)

**Core Data Structures:**
- `AppArchitecture` - Complete app structure with screens, transitions, and APIs
- `AppFlow` - React Flow compatible diagram data (nodes/edges)  
- `Screen` - Individual app screens with comprehensive UX metadata
- `ApiEndpoint` - Backend API definitions
- Enhanced UX types: `UserJourneyContext`, `InteractionPattern`, `AccessibilityRequirements`

### Technology Stack

**Framework & UI:**
- Next.js 15 with TypeScript and App Router
- Tailwind CSS with Shadcn/ui components (new-york style)
- React Flow for interactive diagrams
- Lucide React for icons

**AI Integration:**
- Multi-provider AI support: OpenAI, Anthropic Claude, Google Gemini
- Configurable via environment variables (AI_PROVIDER, OPENAI_API_KEY, etc.)
- Fallback system for when AI services are unavailable

**State Management:**
- React hooks for component state
- No external state management library

### Directory Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes for AI services
│   ├── layout.tsx      # Root layout with Geist fonts
│   └── page.tsx        # Home page (renders AppStudio)
├── components/         
│   ├── AppStudio.tsx   # Main application component
│   ├── flow/           # React Flow diagram components  
│   └── ui/             # Shadcn/ui components
├── lib/
│   ├── ai-providers.ts    # Multi-AI provider service
│   ├── ai-flow-generator.ts # Architecture to flow conversion
│   ├── ai-thinking.ts     # AI thought process simulation
│   └── utils.ts          # Utility functions
└── types/
    └── app-architecture.ts # Core TypeScript definitions
```

### Key Features

**AI-Powered Architecture Generation:**
- Converts natural language to structured app architectures
- Real-time thinking process visualization
- Support for complex UX patterns and user journeys

**Interactive Flow Diagrams:**
- Drag-and-drop node positioning
- Multiple node types (screens, APIs, start/end)
- Export to JSON for further processing

**Multi-Modal Interface:**
- Landing page for initial app descriptions
- Project mode with resizable sidebar chat
- Fullscreen diagram capability

### Development Patterns

**Component Structure:**
- Single main component (AppStudio) handles all application state
- UI components follow Shadcn patterns
- Flow components isolated in separate directory

**API Routes:**
- `/api/generate-architecture` - Main AI architecture generation
- `/api/ai-thinking` - Generates realistic thinking steps for UX

**Environment Configuration:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
```

### Immediate Development Priorities

**Phase 1: Wireframer Tool (Next)**
- Create wireframe generation from flow diagrams
- New UI for wireframe editing and refinement
- Pipeline integration: Flow Diagrams → Wireframes
- Maintain established AI thinking patterns and multi-provider support

**Phase 2: Multi-Tool Home Page**
- Replace landing page with tool selection interface
- Navigation between tools with data handoffs
- Unified design system across all tools

### Development Patterns for New Tools

When adding new AI tools, follow these established patterns:
- **Multi-provider AI support** - Use existing `ai-providers.ts` structure
- **Real-time thinking visualization** - Leverage `ai-thinking.ts` and `ThinkingDialogue` component
- **Consistent UX** - Follow AppStudio's sidebar + main content layout
- **TypeScript-first** - Extend existing type definitions in `app-architecture.ts`
- **Shadcn/ui consistency** - Use established component patterns
- **Structured AI responses** - Generate typed data structures for each tool's output

### Cross-Tool Data Flow

Tools should be designed to accept inputs from other tools:
- Flow Diagrams → Wireframes (architecture data)
- Wireframes → UI Designer (layout data)
- UI Designer → Component Builder (component specs)
- Any tool → GitHub Export (final codebase)