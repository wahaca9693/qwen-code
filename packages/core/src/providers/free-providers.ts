/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ZERO Agent - FREE Cloud AI Providers
 * 
 * Comprehensive integration with open-source cloud AI providers
 * All options are truly free without credit card!
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Provider configurations
 */
export const PROVIDERS = {
  /**
   * Ollama - 100% FREE on your device!
   * No internet needed after installation
   */
  ollama: {
    name: 'Ollama',
    type: 'local',
    free: true,
    apiKey: false,
    models: [
      'qwen2.5',      // Alibaba - recommended!
      'llama3',        // Meta
      'llama3.1',      // Meta
      'mistral',       // Mistral
      'phi',           // Microsoft
      'deepseek-r1',   // DeepSeek - reasoning model!
      'codellama',     // Code-specialized
    ],
    endpoint: 'http://localhost:11434/v1/chat/completions',
    install: 'curl -fsSL https://ollama.com/install | sh',
  },

  /**
   * Cloudflare Workers AI - 10K neurons/day FREE!
   * No credit card needed
   */
  cloudflare: {
    name: 'Cloudflare Workers AI',
    type: 'cloud',
    free: true,
    apiKey: true,  // Account ID + API Token
    models: [
      '@cf/meta/llama-3.3-70b-instruct',
      '@cf/meta/llama-3.1-8b-instruct', 
      '@cf/google/gemma-4-26b-a4b-it',
      '@cf/deepseek-ai/deepseek-r1',
      '@cf/qwen/qwen2.5-72b-instruct',
    ],
    endpoint: 'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.3-70b-instruct',
    signup: 'https://dash.cloudflare.com',
    pricing: '10,000 neurons/day free',
  },

  /**
   * Together AI - $25 free credits!
   * No credit card required
   */
  together: {
    name: 'Together AI',
    type: 'cloud',
    free: true,
    apiKey: true,
    models: [
      'Qwen/Qwen2.5-72B-Instruct',
      'meta-llama/Llama-3.3-70B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.2',
      'DeepSeek/DeepSeek-R1',
    ],
    endpoint: 'https://api.together.ai/v1/chat/completions',
    signup: 'https://together.ai',
    pricing: '$25 free credits for new users',
  },

  /**
   * Hugging Face - FREE inference
   * Community hosted
   */
  huggingface: {
    name: 'Hugging Face',
    type: 'cloud',
    free: true,
    apiKey: true,
    models: [
      'microsoft/Phi-3-mini-128k-instruct',
      'meta-llama/Llama-3.2-1B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.2',
    ],
    endpoint: 'https://api-inference.huggingface.co/models/{model}',
    signup: 'https://huggingface.co',
    pricing: 'Free tier available',
  },

  /**
   * OpenRouter - Free models collection
   * Has free models
   */
  openrouter: {
    name: 'OpenRouter',
    type: 'cloud',
    free: true,
    apiKey: true,
    models: [
      'meta-llama/llama-3.3-70b-instruct',
      'nvidia/nemotron-3-nano-30b-a3b',
    ],
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    signup: 'https://openrouter.ai',
    pricing: 'Free models available',
  },
};

/**
 * Get the best available free provider
 */
export function getBestFreeProvider(): string {
  // Priority: Ollama > Cloudflare > Together > HuggingFace
  return 'ollama';
}

/**
 * Create a chat completion with any provider
 */
export async function chatWithProvider(
  provider: keyof typeof PROVIDERS,
  message: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const config = PROVIDERS[provider];
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  const model = options.model || config.models[0];
  
  switch (provider) {
    case 'ollama':
      return chatOllama(message, model, options);
    case 'cloudflare':
      return chatCloudflare(message, model, options);
    case 'together':
      return chatTogether(message, model, options);
    case 'huggingface':
      return chatHuggingFace(message, model, options);
    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
}

async function chatOllama(message: string, model: string, opts: any): Promise<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: message }],
      stream: false,
    }),
  });
  
  const data = await response.json();
  return data.message?.content || '';
}

async function chatCloudflare(message: string, model: string, opts: any): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare credentials not set. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN');
  }
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        max_tokens: opts.maxTokens || 2048,
      }),
    }
  );
  
  const data = await response.json();
  return data.response || '';
}

async function chatTogether(message: string, model: string, opts: any): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Together AI API key not set. Get free key at https://together.ai');
  }
  
  const response = await fetch('https://api.together.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: message }],
      temperature: opts.temperature || 0.7,
      max_tokens: opts.maxTokens || 2048,
    }),
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function chatHuggingFace(message: string, model: string, opts: any): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not set. Get free key at https://huggingface.co');
  }
  
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_new_tokens: opts.maxTokens || 512,
          temperature: opts.temperature || 0.7,
        },
      }),
    }
  );
  
  const data = await response.json();
  if (Array.isArray(data)) {
    return data[0]?.generated_text || '';
  }
  return '';
}

export default {
  PROVIDERS,
  getBestFreeProvider,
  chatWithProvider,
};