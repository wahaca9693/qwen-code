/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface ExecutionTask {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  exitCode: number;
  errors?: string[];
  duration: number;
}

export interface TestResult {
  success: boolean;
  passed: number;
  failed: number;
  errors: string[];
  output: string;
}

export interface ServerInfo {
  pid?: number;
  url?: string;
  status: 'running' | 'stopped' | 'crashed';
  output?: string;
}

/**
 * Execution Agent - runs commands, servers, and tests
 */
export class ExecutionAgent {
  private runningServers: Map<string, ServerInfo> = new Map();

  /**
   * Run a shell command
   */
  async runCommand(
    command: string, 
    options?: { cwd?: string; env?: Record<string, string>; timeout?: number }
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: options?.cwd,
        env: { ...process.env, ...options?.env },
        timeout: options?.timeout || 60000
      });
      
      return {
        success: true,
        output: stdout,
        exitCode: 0,
        duration: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || '',
        exitCode: error.code || 1,
        errors: [error.message],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Detect package manager and install dependencies
   */
  async installDependencies(projectPath: string): Promise<ExecutionResult> {
    // Check for package.json
    try {
      await fs.access(path.join(projectPath, 'package.json'));
      return await this.runCommand('npm install', { cwd: projectPath });
    } catch {}
    
    // Check for requirements.txt
    try {
      await fs.access(path.join(projectPath, 'requirements.txt'));
      return await this.runCommand('pip install -r requirements.txt', { cwd: projectPath });
    } catch {}
    
    // Check for go.mod
    try {
      await fs.access(path.join(projectPath, 'go.mod'));
      return await this.runCommand('go mod download', { cwd: projectPath });
    } catch {}
    
    // Check for Cargo.toml
    try {
      await fs.access(path.join(projectPath, 'Cargo.toml'));
      return await this.runCommand('cargo build', { cwd: projectPath });
    } catch {}
    
    return {
      success: false,
      output: '',
      exitCode: 1,
      errors: ['No package manager detected'],
      duration: 0
    };
  }

  /**
   * Start development server
   */
  async startDevServer(
    projectPath: string, 
    command: string = 'npm run dev'
  ): Promise<ServerInfo> {
    const serverId = `${projectPath}-${Date.now()}`;
    
    try {
      const child = spawn(command, [], {
        cwd: projectPath,
        shell: true,
        env: process.env
      });
      
      let output = '';
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      child.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      const serverInfo: ServerInfo = {
        pid: child.pid,
        status: 'running',
        output
      };
      
      this.runningServers.set(serverId, serverInfo);
      
      // Try to detect URL
      setTimeout(() => {
        const urlMatch = output.match(/http[ss]?:\/\/[^\s]+/);
        if (urlMatch) {
          const info = this.runningServers.get(serverId);
          if (info) {
            info.url = urlMatch[0];
            this.runningServers.set(serverId, info);
          }
        }
      }, 3000);
      
      return serverInfo;
    } catch (error) {
      return {
        status: 'crashed',
        output: (error as Error).message
      };
    }
  }

  /**
   * Stop dev server
   */
  async stopDevServer(projectPath: string): Promise<boolean> {
    for (const [id, info] of this.runningServers) {
      if (id.startsWith(projectPath)) {
        if (info.pid) {
          process.kill(info.pid);
          this.runningServers.delete(id);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Run tests - detect and run appropriate test runner
   */
  async runTests(projectPath: string): Promise<TestResult> {
    // Check for test configuration and run appropriate tests
    const testCommands = [
      { files: ['vitest.config.ts', 'vitest.config.js'], command: 'npx vitest run' },
      { files: ['jest.config.js', 'jest.config.ts'], command: 'npx jest' },
      { files: ['pytest.ini', 'pyproject.toml'], command: 'pytest' },
      { files: ['Cargo.toml'], command: 'cargo test' },
      { files: ['go.sum'], command: 'go test ./...' }
    ];
    
    for (const { files, command } of testCommands) {
      for (const file of files) {
        try {
          await fs.access(path.join(projectPath, file));
          const result = await this.runCommand(command, { cwd: projectPath, timeout: 120000 });
          
          return {
            success: result.success,
            passed: result.success ? 1 : 0,
            failed: result.success ? 0 : 1,
            errors: result.errors || [],
            output: result.output
          };
        } catch {}
      }
    }
    
    // Default to npm test
    const result = await this.runCommand('npm test', { cwd: projectPath, timeout: 120000 });
    
    return {
      success: result.success,
      passed: result.success ? 1 : 0,
      failed: result.success ? 0 : 1,
      errors: result.errors || [],
      output: result.output
    };
  }

  /**
   * Parse test output and report pass/fail
   */
  parseTestOutput(output: string): TestResult {
    const result: TestResult = {
      success: false,
      passed: 0,
      failed: 0,
      errors: [],
      output
    };
    
    // Parse Vitest/Jest output
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    if (passedMatch) result.passed = parseInt(passedMatch[1]);
    if (failedMatch) result.failed = parseInt(failedMatch[1]);
    
    result.success = result.failed === 0;
    
    // Extract error details
    const errorMatches = output.match(/✓|✗/g);
    if (errorMatches) {
      result.errors = output.split('\n').filter(l => l.includes('FAIL') || l.includes('Error'));
    }
    
    return result;
  }

  /**
   * Auto-fix and re-run tests
   */
  async autoFixAndRetest(
    projectPath: string, 
    fixes: string[], 
    maxRetries: number = 3
  ): Promise<TestResult> {
    let lastResult: TestResult = { success: false, passed: 0, failed: 0, errors: [], output: '' };
    
    for (let i = 0; i < maxRetries; i++) {
      // Apply fixes
      for (const fix of fixes) {
        await this.runCommand(fix, { cwd: projectPath });
      }
      
      // Re-run tests
      lastResult = await this.runTests(projectPath);
      
      if (lastResult.success) {
        break;
      }
    }
    
    return lastResult;
  }

  /**
   * Check server health
   */
  async checkServerHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Run Docker commands
   */
  async runDocker(
    command: string, 
    dockerfile?: string
  ): Promise<ExecutionResult> {
    if (dockerfile) {
      return await this.runCommand(`docker build -t zero-app -f ${dockerfile} .`);
    }
    return await this.runCommand(`docker ${command}`);
  }
}