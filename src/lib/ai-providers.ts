import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private google?: GoogleGenerativeAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider() {
    switch (this.config.provider) {
      case 'openai':
        this.openai = new OpenAI({
          apiKey: this.config.apiKey,
        });
        break;
      case 'anthropic':
        this.anthropic = new Anthropic({
          apiKey: this.config.apiKey,
        });
        break;
      case 'google':
        this.google = new GoogleGenerativeAI(this.config.apiKey);
        break;
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt);
        case 'google':
          return await this.generateWithGoogle(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`AI generation failed with ${this.config.provider}:`, error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async generateWithAnthropic(prompt: string): Promise<string> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');
    
    const message = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find(block => block.type === 'text');
    return textContent?.type === 'text' ? textContent.text : '';
  }

  private async generateWithGoogle(prompt: string): Promise<string> {
    if (!this.google) throw new Error('Google AI not initialized');
    
    const model = this.google.getGenerativeModel({ model: this.config.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  }
}

export function createAIService(): AIService {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
  
  let apiKey: string;
  let model: string;

  switch (provider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY || '';
      model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      break;
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      model = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
      break;
    case 'google':
      apiKey = process.env.GOOGLE_API_KEY || '';
      model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
      break;
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}. Please set the appropriate environment variable.`);
  }

  return new AIService({ provider, apiKey, model });
}
