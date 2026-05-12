/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Agent } from '../agents/index.js';
import type { Message } from '../core/messages.js';
import type { ToolUse } from '../core/tool-use.js';

export type AgentType = 
  | 'orchestrator'
  | 'code'
  | 'browser'
  | 'execution'
  | 'code-review'
  | 'file-system'
  | 'design';

export interface AgentCapability {
  type: AgentType;
  name: string;
  description: string;
  canHandle(task: string): boolean;
}

export interface AgentTask {
  id: string;
  type: AgentType;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
  agentId?: string;
}

export interface MultiAgentMessage extends Message {
  agentType?: AgentType;
  taskId?: string;
}

export interface AgentResult {
  success: boolean;
  output: string;
  agentType: AgentType;
  taskId: string;
  artifacts?: Array<{
    type: string;
    path?: string;
    content?: string;
  }>;
}