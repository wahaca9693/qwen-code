/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ZERO Agent - Multi-Agent System Coordinator
 * 
 * This is the main entry point that coordinates all specialist agents.
 * The system works as follows:
 * 
 * 1. User sends a request
 * 2. Orchestrator analyzes the request and breaks it into tasks
 * 3. Tasks are distributed to appropriate specialist agents
 * 4. Agents execute in parallel when possible
 * 5. Results are aggregated and presented to the user
 * 
 * Agent Types:
 * - Orchestrator: Task coordination and planning
 * - Code: Writing, editing, refactoring code
 * - Browser: Web search, navigation, scraping
 * - Execution: Running commands, tests, servers
 * - Code Review: Bug detection, security scanning
 * - File System: File management operations
 * - Design: UI/UX review and improvements
 */

import { OrchestratorAgent } from './orchestrator.js';
import { CodeAgent } from './code-agent.js';
import { BrowserAgent } from './browser-agent.js';
import { ExecutionAgent } from './execution-agent.js';
import { CodeReviewAgent } from './code-review-agent.js';
import { FileSystemAgent } from './filesystem-agent.js';
import type { Agent } from '../agents/index.js';
import type { AgentTask, AgentType, AgentResult } from './types.js';

export interface ZEROConfig {
  headlessBrowser?: boolean;
  maxRetries?: number;
  enableDebug?: boolean;
  modelProvider?: string;
}

export class ZEROAgentSystem {
  private orchestrator: OrchestratorAgent;
  private codeAgent: CodeAgent;
  private browserAgent: BrowserAgent;
  private executionAgent: ExecutionAgent;
  private codeReviewAgent: CodeReviewAgent;
  private fileSystemAgent: FileSystemAgent;
  private config: ZEROConfig;

  constructor(agent: Agent, config?: ZEROConfig) {
    this.orchestrator = new OrchestratorAgent(agent);
    this.codeAgent = new CodeAgent(agent);
    this.browserAgent = new BrowserAgent({ headless: config?.headlessBrowser ?? true });
    this.executionAgent = new ExecutionAgent();
    this.codeReviewAgent = new CodeReviewAgent();
    this.fileSystemAgent = new FileSystemAgent();
    this.config = config || {};
  }

  /**
   * Initialize the multi-agent system
   */
  async initialize(): Promise<void> {
    await this.browserAgent.initialize();
    console.log('[ZERO] Multi-agent system initialized');
  }

  /**
   * Process user request using all relevant agents
   */
  async processRequest(userMessage: string): Promise<{
    success: boolean;
    results: AgentResult[];
    summary: string;
  }> {
    if (this.config.enableDebug) {
      console.log('[ZERO] Processing request:', userMessage);
    }

    // Step 1: Analyze request and create tasks
    const tasks = await this.orchestrator.analyzeRequest(userMessage);
    
    if (this.config.enableDebug) {
      console.log('[ZERO] Tasks created:', tasks.length);
    }

    // Step 2: Execute tasks
    const results = await this.orchestrator.executeTasks(tasks);

    // Step 3: Generate summary
    const success = results.every(r => r.success);
    const summary = this.generateSummary(results);

    return { success, results, summary };
  }

  private generateSummary(results: AgentResult[]): string {
    const byType = new Map<AgentType, number>();
    
    for (const result of results) {
      const count = byType.get(result.agentType) || 0;
      byType.set(result.agentType, count + 1);
    }

    let summary = 'Completed with ';
    const parts: string[] = [];
    
    byType.forEach((count, type) => {
      parts.push(`${count} ${type} task(s)`);
    });

    summary += parts.join(', ');
    
    return summary;
  }

  // ========================================
  // Direct agent access methods
  // ========================================

  /**
   * Get Code Agent for direct operations
   */
  getCodeAgent(): CodeAgent {
    return this.codeAgent;
  }

  /**
   * Get Browser Agent for direct operations
   */
  getBrowserAgent(): BrowserAgent {
    return this.browserAgent;
  }

  /**
   * Get Execution Agent for direct operations
   */
  getExecutionAgent(): ExecutionAgent {
    return this.executionAgent;
  }

  /**
   * Get Code Review Agent for direct operations
   */
  getCodeReviewAgent(): CodeReviewAgent {
    return this.codeReviewAgent;
  }

  /**
   * Get File System Agent for direct operations
   */
  getFileSystemAgent(): FileSystemAgent {
    return this.fileSystemAgent;
  }

  /**
   * Get Orchestrator for direct operations
   */
  getOrchestrator(): OrchestratorAgent {
    return this.orchestrator;
  }

  // ========================================
  // Convenience methods
  // ========================================

  /**
   * Full workflow: Write code, test it, review it
   */
  async writeAndTestCode(
    filePath: string, 
    content: string
  ): Promise<{ success: boolean; output: string }> {
    // Write code
    const writeResult = await this.codeAgent.writeCode(filePath, content);
    if (!writeResult.success) {
      return { success: false, output: writeResult.errors?.[0] || 'Failed to write code' };
    }

    // Get project path
    const projectPath = filePath.includes('/') 
      ? filePath.substring(0, filePath.lastIndexOf('/')) 
      : '.';

    // Run tests
    const testResult = await this.executionAgent.runTests(projectPath);
    
    // If tests fail, try to fix
    if (!testResult.success) {
      const fixed = await this.executionAgent.autoFixAndRetest(projectPath, [], 3);
      return {
        success: fixed.success,
        output: fixed.success ? 'Tests passed after auto-fix' : testResult.output
      };
    }

    return { success: true, output: 'Code written and tests passed' };
  }

  /**
   * Research and implement: Search web + write code
   */
  async researchAndImplement(
    query: string, 
    filePath: string,
    codeTemplate: string
  ): Promise<{ success: boolean; output: string }> {
    // Search web for references
    const searchResults = await this.browserAgent.search(query);
    
    if (this.config.enableDebug) {
      console.log('[ZERO] Search results:', searchResults.length);
    }

    // Write implementation
    const writeResult = await this.codeAgent.writeCode(filePath, codeTemplate);
    
    return {
      success: writeResult.success,
      output: writeResult.success 
        ? `Researched and implemented: ${searchResults.length} reference(s) found`
        : writeResult.errors?.[0] || 'Failed'
    };
  }

  /**
   * Full code review scan
   */
  async scanAndReview(projectPath: string): Promise<{
    success: boolean;
    report: string;
  }> {
    const report = await this.codeReviewAgent.scanProject(projectPath);
    const detailed = this.codeReviewAgent.generateDetailedReport(report);
    
    return {
      success: report.criticalIssues === 0,
      report: detailed
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    await this.browserAgent.close();
    console.log('[ZERO] Multi-agent system shutdown');
  }
}

// Export all agent classes
export { OrchestratorAgent } from './orchestrator.js';
export { CodeAgent } from './code-agent.js';
export { BrowserAgent } from './browser-agent.js';
export { ExecutionAgent } from './execution-agent.js';
export { CodeReviewAgent } from './code-review-agent.js';
export { FileSystemAgent } from './filesystem-agent.js';
export type { AgentTask, AgentType, AgentResult } from './types.js';