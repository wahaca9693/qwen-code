/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Agent } from '../agents/index.js';
import type { Message } from '../core/messages.js';
import { v4 as uuidv4 } from 'uuid';
import type { AgentTask, AgentType, AgentResult } from './types.js';

/**
 * Orchestrator Agent - manages and coordinates all specialist agents
 * This is the brain of the multi-agent system
 */
export class OrchestratorAgent {
  private agent: Agent;
  private taskGraph: Map<string, AgentTask> = new Map();
  private results: Map<string, AgentResult> = new Map();

  constructor(agent: Agent) {
    this.agent = agent;
  }

  /**
   * Analyze user request and break it into sub-tasks
   */
  async analyzeRequest(userMessage: string): Promise<AgentTask[]> {
    const tasks: AgentTask[] = [];
    
    // Analyze what agents are needed
    const lowerMessage = userMessage.toLowerCase();
    
    // Code writing task
    if (lowerMessage.includes('write') || lowerMessage.includes('create') || 
        lowerMessage.includes('implement') || lowerMessage.includes('fix')) {
      tasks.push(this.createTask('code', 'Write or modify code'));
    }
    
    // Browser/search task
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || 
        lowerMessage.includes('browse') || lowerMessage.includes('web')) {
      tasks.push(this.createTask('browser', 'Search or browse web'));
    }
    
    // Execution task
    if (lowerMessage.includes('run') || lowerMessage.includes('test') || 
        lowerMessage.includes('execute') || lowerMessage.includes('install')) {
      tasks.push(this.createTask('execution', 'Run or test code'));
    }
    
    // Code review task
    if (lowerMessage.includes('review') || lowerMessage.includes('check') || 
        lowerMessage.includes('analyze')) {
      tasks.push(this.createTask('code-review', 'Review or analyze code'));
    }
    
    // File system task
    if (lowerMessage.includes('delete') || lowerMessage.includes('move') || 
        lowerMessage.includes('copy') || lowerMessage.includes('list')) {
      tasks.push(this.createTask('file-system', 'File system operations'));
    }
    
    // If no specific task detected, default to code agent
    if (tasks.length === 0) {
      tasks.push(this.createTask('code', 'Handle the request'));
    }
    
    return tasks;
  }

  private createTask(type: AgentType, description: string): AgentTask {
    const task: AgentTask = {
      id: uuidv4(),
      type,
      description,
      status: 'pending'
    };
    this.taskGraph.set(task.id, task);
    return task;
  }

  /**
   * Execute tasks in parallel where possible
   */
  async executeTasks(tasks: AgentTask[]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    // Execute independent tasks in parallel
    const independentTasks = tasks.filter(t => 
      t.type === 'browser' || t.type === 'file-system'
    );
    
    const dependentTasks = tasks.filter(t => 
      t.type === 'code' || t.type === 'execution' || t.type === 'code-review'
    );
    
    // Run parallel tasks
    if (independentTasks.length > 0) {
      const parallelResults = await Promise.all(
        independentTasks.map(task => this.executeSingleTask(task))
      );
      results.push(...parallelResults);
    }
    
    // Run dependent tasks sequentially
    for (const task of dependentTasks) {
      const result = await this.executeSingleTask(task);
      results.push(result);
    }
    
    return results;
  }

  private async executeSingleTask(task: AgentTask): Promise<AgentResult> {
    task.status = 'running';
    
    // Simulate task execution - in real implementation, this would 
    // delegate to the actual specialized agent
    const agentPrompts: Record<AgentType, string> = {
      'orchestrator': 'You are the Orchestrator - coordinate all agents',
      'code': 'You are the Code Agent - write, edit, and refactor code',
      'browser': 'You are the Browser Agent - search web and browse pages',
      'execution': 'You are the Execution Agent - run commands and tests',
      'code-review': 'You are the Code Review Agent - review code for issues',
      'file-system': 'You are the File System Agent - manage files and directories',
      'design': 'You are the Design Agent - review UI/UX designs'
    };
    
    const result: AgentResult = {
      success: true,
      output: `Task ${task.type} executed: ${task.description}`,
      agentType: task.type,
      taskId: task.id,
      artifacts: []
    };
    
    task.status = 'completed';
    this.results.set(task.id, result);
    
    return result;
  }

  /**
   * Get task graph status
   */
  getTaskStatus(): Map<string, AgentTask> {
    return this.taskGraph;
  }

  /**
   * Get all results
   */
  getResults(): Map<string, AgentResult> {
    return this.results;
  }

  /**
   * Retry failed tasks
   */
  async retryFailedTasks(maxRetries: number = 3): Promise<AgentResult[]> {
    const failedTasks = Array.from(this.taskGraph.values())
      .filter(t => t.status === 'failed');
    
    const results: AgentResult[] = [];
    
    for (const task of failedTasks) {
      for (let i = 0; i < maxRetries; i++) {
        task.status = 'pending';
        const result = await this.executeSingleTask(task);
        if (result.success) {
          results.push(result);
          break;
        }
      }
    }
    
    return results;
  }
}