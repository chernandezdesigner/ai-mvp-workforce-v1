# AI App Studio - Flow Generation Tool

An AI-powered app studio where users can describe their app idea and have it turned into a structured architecture with visual flow diagrams. This is the first milestone focusing on flow diagramming and architecture generation.

## ✨ Features

- **Natural Language Input**: Describe your app in plain English
- **AI-Powered Architecture**: Generate complete app structures with screens, APIs, and transitions
- **Visual Flow Diagrams**: Interactive React Flow diagrams with custom node types
- **Multiple AI Providers**: Support for OpenAI, Anthropic Claude, and Google Gemini
- **JSON Export**: Download structured architecture definitions
- **Responsive Design**: Modern UI with Shadcn components and Tailwind CSS

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up AI API Keys

Create a `.env.local` file in the root directory:

```env
# Choose your preferred AI provider
AI_PROVIDER=openai

# OpenAI (recommended)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# OR Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307

# OR Google Gemini
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_MODEL=gemini-1.5-flash
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔑 Getting API Keys

### OpenAI (Recommended)
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env.local` as `OPENAI_API_KEY`

### Anthropic Claude
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add it to your `.env.local` as `ANTHROPIC_API_KEY`

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env.local` as `GOOGLE_API_KEY`

## 🎯 How It Works

1. **Describe Your App**: Enter a goal like "Build a todo app with login and dashboard"
2. **AI Analysis**: The system uses AI to analyze your goal and generate a complete architecture
3. **Visual Flow**: See your app structure as an interactive flow diagram
4. **Customize**: Drag nodes around and modify the flow as needed
5. **Export**: Download the JSON architecture for the next development phases

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI**: Tailwind CSS + Shadcn/ui components
- **Flow Diagrams**: React Flow
- **AI Integration**: OpenAI, Anthropic, Google Gemini APIs
- **State Management**: React hooks

## 📁 Project Structure

```
src/
├── components/
│   ├── flow/           # React Flow components
│   ├── ui/             # Shadcn UI components
│   └── AppStudio.tsx   # Main application component
├── lib/
│   ├── ai-providers.ts # AI service integrations
│   └── ai-flow-generator.ts # Architecture generation logic
└── types/
    └── app-architecture.ts # TypeScript definitions
```

## 🔄 Fallback Mode

If AI generation fails (missing API keys, network issues, etc.), the app automatically falls back to a smart keyword-based analysis system, so you can still test the flow generation features.

## 🚧 Future Milestones

This is just the first step! Coming next:

- **UI/UX Design**: Generate wireframes and apply design systems
- **Frontend Code**: React component generation with Tailwind + Shadcn
- **Backend Setup**: Supabase integration and API generation  
- **Export & Deploy**: GitHub sync and deployment options

## 🤝 Contributing

This project is part of a larger AI-powered development workflow. Feel free to contribute improvements to the flow generation and visualization features.

## 📄 License

MIT License - see LICENSE file for details.
