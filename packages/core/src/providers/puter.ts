/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Puter.js Provider Integration for ZERO Agent
 * 
 * Puter.js provides free access to MiniMax M2.7 through their "User-Pays" model.
 * This means: No API key needed for developers! Users pay for their own usage.
 */

import { puter } from '@heyputer/puter.js';

export interface PuterConfig {
  authToken?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class PuterProvider {
  private authToken: string;
  private model: string;
  
  constructor(config: PuterConfig = {}) {
    this.authToken = config.authToken || '';
    this.model = config.model || 'minimax/minimax-m2.7';
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    puter.setAuthToken(token);
  }
  
  /**
   * Send chat message
   */
  async chat(message: string, options: { 
    temperature?: number; 
    maxTokens?: number;
    systemPrompt?: string;
  } = {}): Promise<string> {
    if (this.authToken) {
      puter.setAuthToken(this.authToken);
    }
    
    const response = await puter.ai.chat(message, {
      model: this.model,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      system: options.systemPrompt
    });
    
    return response.message.content;
  }
  
  /**
   * Get usage stats
   */
  async getUsage(): Promise<{ monthUsed: number; monthLimit: number }> {
    const usage = await puter.getMonthlyUsage();
    return { monthUsed: usage.used, monthLimit: usage.limit };
  }
}

export default PuterProvider;