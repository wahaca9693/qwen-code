/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ZERO Agent - Automatic Ollama Integration
 * 
 * Downloads and runs automatically when user runs the command.
 * Uses lightweight models for fast download.
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const OLLAMA_BASE = 'http://localhost:11434';
const LIGHTWEIGHT_MODELS = {
  // Fastest small models - download quickly
  'phi': 'microsoft/phi:3.5b',           // ~2GB
  'qwen2.5:3b': 'qwen2.5:3b',            // ~2GB  
  'llama3.2:1b': 'llama3.2:1b',            // ~1GB
  'mistral': 'mistral:7b',                   // ~4GB
};

const DEFAULT_MODEL = 'phi';

/**
 * Check if Ollama is installed
 */
export async function isOllamaInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('which', ['ollama']);
    proc.on('close', (code) => resolve(code === 0));
  });
}

/**
 * Check if Ollama is running
 */
export async function isOllamaRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
      method: 'GET',
      signal: { name: 'signal', signal: () => {} } as any
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if model is downloaded
 */
export async function isModelDownloaded(model: string): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = await response.json();
    return data.models?.some((m: any) => m.name === model) || false;
  } catch {
    return false;
  }
}

/**
 * Download/start the smallest available model
 */
export async function autoStartOllama(): Promise<{
  success: boolean;
  message: string;
  model: string;
}> {
  // Try each model until one works
  for (const [name, model] of Object.entries(LIGHTWEIGHT_MODELS)) {
    console.log(`🤖 Trying ${name}...`);
    
    try {
      // Pull the model
      const pullProcess = spawn('ollama', ['pull', model], {
        stdio: 'inherit'
      });
      
      await new Promise<void>((resolve) => {
        pullProcess.on('close', () => resolve());
      });
      
      // Run the model
      const runProcess = spawn('ollama', ['run', model], {
        stdio: 'inherit',
        detached: true
      });
      
      // Wait for startup
      await new Promise(r => setTimeout(r, 3000));
      
      return {
        success: true,
        message: `✅ ${name} is running!`,
        model
      };
    } catch (e) {
      console.log(`⚠️ ${name} failed, trying next...`);
    }
  }
  
  return {
    success: false,
    message: '❌ Could not start any model',
    model: ''
  };
}

/**
 * Simple chat with Ollama
 */
export async function chat(message: string, options: {
  model?: string;
  temperature?: number;
} = {}): Promise<string> {
  const model = options.model || DEFAULT_MODEL;
  
  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      stream: false
    })
  });
  
  const data = await response.json();
  return data.message?.content || '';
}

/**
 * Get list of available models
 */
export async function listModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}

/**
 * Main startup function
 */
export async function startZeroAgent(): Promise<void> {
  console.log('🚀 ZERO Agent - Auto Starting...\n');
  
  // Check if Ollama exists
  const installed = await isOllamaInstalled();
  if (!installed) {
    console.log('📥 Installing Ollama...');
    console.log('👉 Run: curl -fsSL https://ollama.com/install | sh');
    return;
  }
  
  // Check if running
  const running = await isOllamaRunning();
  if (!running) {
    console.log('▶️ Starting Ollama...');
    spawn('ollama', ['serve'], { detached: true });
    await new Promise(r => setTimeout(r, 3000));
  }
  
  // Check/download model
  const downloaded = await isModelDownloaded(DEFAULT_MODEL);
  if (!downloaded) {
    console.log(`📥 Downloading ${DEFAULT_MODEL}...`);
    console.log('(This happens once, then stays cached!)');
  }
  
  // Ready!
  const models = await listModels();
  console.log(`\n✅ ZERO Agent Ready!`);
  console.log(`📦 Available models: ${models.join(', ') || 'None'}`);
  console.log(`💬 Model: ${DEFAULT_MODEL}`);
  console.log(`\n🧪 Test: "مرحبا كيف حالك؟"`);
}

export default {
  start: startZeroAgent,
  chat,
  listModels,
  checkRunning: isOllamaRunning
};