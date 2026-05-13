/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Google Gemini Provider for ZERO Agent
 * Using user's API key with Gemini 2.5 Pro (strongest model)
 */

export const GEMINI_CONFIG = {
  provider: 'google',
  model: 'gemini-2.5-pro',
  displayName: 'Gemini 2.5 Pro',
  apiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
  apiBase: 'https://generativelanguage.googleapis.com/v1beta',
  description: 'Google Gemini 2.5 Pro - Most capable model',
  contextWindow: 1048576,  // 1M tokens!
  outputLimit: 65536,
  supportsVision: true,
  supportsStreaming: true,
  features: {
    thinking: true,  // Built-in reasoning
    vision: true,
    codeExecution: true
  }
};

/**
 * Chat completion with Gemini 2.5 Pro
 */
export async function chatWithGemini(message: string, options: {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
} = {}): Promise<string> {
  const apiKey = GEMINI_CONFIG.apiKey;
  const model = GEMINI_CONFIG.model;
  
  const response = await fetch(
    `${GEMINI_CONFIG.apiBase}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: options.systemPrompt ? {
          parts: [{ text: options.systemPrompt }]
        } : undefined,
        generationConfig: {
          temperature: options.temperature ?? 0.9,
          maxOutputTokens: options.maxTokens ?? 8192,
          topP: 0.95,
          topK: 64
        }
      })
    }
  );
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';
}

/**
 * Stream chat with Gemini
 */
export async function* chatStreamGemini(
  message: string,
  options: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const apiKey = GEMINI_CONFIG.apiKey;
  const model = GEMINI_CONFIG.model;
  
  const response = await fetch(
    `${GEMINI_CONFIG.apiBase}/models/${model}:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.9,
          maxOutputTokens: options.maxTokens ?? 8192,
          topP: 0.95,
          topK: 64
        }
      })
    }
  );
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) return;
  
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value);
    const lines = buffer.split('\n').filter(l => l.startsWith('data: '));
    
    for (const line of lines) {
      const json = line.slice(6);
      try {
        const data = JSON.parse(json);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {}
    }
  }
}

export default { config: GEMINI_CONFIG, chat: chatWithGemini, chatStream: chatStreamGemini };