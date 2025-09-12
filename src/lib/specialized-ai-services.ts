import { createAIService, AIService } from './ai-providers';

export interface SpecializedAIConfig {
  flowDiagrams: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  wireframes: {
    provider: string;
    model: string;  
    temperature: number;
    maxTokens: number;
  };
  thinking: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

const SPECIALIZED_CONFIG: SpecializedAIConfig = {
  flowDiagrams: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022', // Most capable for complex reasoning
    temperature: 0.3, // More focused/consistent
    maxTokens: 4000,
  },
  wireframes: {
    provider: 'anthropic', 
    model: 'claude-3-5-sonnet-20241022', // Best for structured output
    temperature: 0.4,
    maxTokens: 3000,
  },
  thinking: {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307', // Fast for thinking simulation
    temperature: 0.7, // More creative for varied thoughts
    maxTokens: 1000,
  }
};

export class SpecializedAIService {
  private services: Map<string, AIService> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    for (const [tool, config] of Object.entries(SPECIALIZED_CONFIG)) {
      const service = new AIService({
        provider: config.provider as any,
        apiKey: this.getApiKey(config.provider),
        model: config.model,
      });
      this.services.set(tool, service);
    }
  }

  private getApiKey(provider: string): string {
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_API_KEY || '';
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY || '';
      case 'google':
        return process.env.GOOGLE_API_KEY || '';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async generateFlowDiagram(prompt: string): Promise<string> {
    const service = this.services.get('flowDiagrams')!;
    const config = SPECIALIZED_CONFIG.flowDiagrams;
    
    return await this.generateWithConfig(service, prompt, config);
  }

  async generateWireframes(prompt: string): Promise<string> {
    const service = this.services.get('wireframes')!;
    const config = SPECIALIZED_CONFIG.wireframes;
    
    return await this.generateWithConfig(service, prompt, config);
  }

  async generateThinking(prompt: string): Promise<string> {
    const service = this.services.get('thinking')!;
    const config = SPECIALIZED_CONFIG.thinking;
    
    return await this.generateWithConfig(service, prompt, config);
  }

  private async generateWithConfig(
    service: AIService, 
    prompt: string, 
    config: { temperature: number; maxTokens: number }
  ): Promise<string> {
    // Override the service's generateText method with specialized config
    return await (service as any).generateText(prompt, {
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });
  }
}

export const specializedAI = new SpecializedAIService();