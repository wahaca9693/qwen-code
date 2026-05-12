/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFile, writeFile, glob, grep } from '../tools/index.js';
import type { Agent } from '../agents/index.js';

export interface CodeTask {
  action: 'read' | 'write' | 'edit' | 'create' | 'delete' | 'refactor';
  filePath?: string;
  content?: string;
  searchPattern?: string;
  replaceWith?: string;
}

export interface CodeResult {
  success: boolean;
  files: string[];
  changes: string[];
  errors?: string[];
}

/**
 * Code Agent - specialized in writing, editing, and refactoring code
 */
export class CodeAgent {
  private agent: Agent;
  private projectContext: Map<string, any> = new Map();

  constructor(agent: Agent) {
    this.agent = agent;
  }

  /**
   * Read and understand project structure
   */
  async analyzeProject(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    
    // Find all TypeScript/JavaScript files
    const tsFiles = await glob(`${projectPath}/**/*.ts`);
    const jsFiles = await glob(`${projectPath}/**/*.js`);
    const tsxFiles = await glob(`${projectPath}/**/*.tsx`);
    
    files.push(...tsFiles, ...jsFiles, ...tsxFiles);
    
    // Analyze file structure
    for (const file of files.slice(0, 50)) { // Limit to 50 files
      const content = await readFile(file);
      this.projectContext.set(file, {
        size: content.length,
        lines: content.split('\n').length
      });
    }
    
    return files;
  }

  /**
   * Write code to file
   */
  async writeCode(filePath: string, content: string): Promise<CodeResult> {
    try {
      await writeFile(filePath, content);
      return {
        success: true,
        files: [filePath],
        changes: [`Created/updated: ${filePath}`]
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        changes: [],
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Edit code surgically - only change what's needed
   */
  async editCode(
    filePath: string, 
    searchPattern: string, 
    replaceWith: string
  ): Promise<CodeResult> {
    try {
      const content = await readFile(filePath);
      const newContent = content.replace(searchPattern, replaceWith);
      
      await writeFile(filePath, newContent);
      
      return {
        success: true,
        files: [filePath],
        changes: [`Edited: ${filePath}`]
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        changes: [],
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Detect language, framework, and coding style
   */
  async detectProjectTech(projectPath: string): Promise<{
    language: string;
    framework: string;
    style: string;
  }> {
    const result = {
      language: 'typescript',
      framework: 'unknown',
      style: 'unknown'
    };
    
    // Check for package.json
    const pkgJson = await readFile(`${projectPath}/package.json`).catch(() => null);
    if (pkgJson) {
      try {
        const pkg = JSON.parse(pkgJson);
        if (pkg.dependencies?.react) result.framework = 'react';
        else if (pkg.dependencies?.vue) result.framework = 'vue';
        else if (pkg.dependencies?.angular) result.framework = 'angular';
        
        result.language = pkg.dependencies?.typescript ? 'typescript' : 'javascript';
      } catch {}
    }
    
    // Check for tsconfig.json
    const tsconfig = await readFile(`${projectPath}/tsconfig.json`).catch(() => null);
    if (tsconfig) {
      result.language = 'typescript';
    }
    
    // Check for .prettierrc
    const prettier = await readFile(`${projectPath}/.prettierrc`).catch(() => null)
      || await readFile(`${projectPath}/.prettierrc.json`).catch(() => null);
    if (prettier) {
      result.style = 'prettier';
    }
    
    return result;
  }

  /**
   * Create a complete file with proper structure
   */
  async createFile(
    filePath: string,
    template: 'typescript' | 'javascript' | 'react' | 'vue' | 'node',
    content: string
  ): Promise<CodeResult> {
    const headers: Record<string, string> = {
      'typescript': `/**
 * ZERO Agent Generated Code
 * Created: ${new Date().toISOString()}
 */

`,
      'javascript': `/**
 * ZERO Agent Generated Code
 * Created: ${new Date().toISOString()}
 */

`,
      'react': `/**
 * ZERO Agent Generated React Component
 * Created: ${new Date().toISOString()}
 */

import React from 'react';

`,
      'vue': `/**
 * ZERO Agent Generated Vue Component
 * Created: ${new Date().toISOString()}
 */

`,
      'node': `/**
 * ZERO Agent Generated Node.js Code
 * Created: ${new Date().toISOString()}
 */

`
    };
    
    const fullContent = (headers[template] || headers.typescript) + content;
    
    return this.writeCode(filePath, fullContent);
  }

  /**
   * Find code patterns across the project
   */
  async findCode(
    projectPath: string, 
    pattern: string
  ): Promise<Array<{file: string; matches: string[]}[]> {
    const results = await grep(pattern, { paths: [projectPath] });
    return results;
  }
}