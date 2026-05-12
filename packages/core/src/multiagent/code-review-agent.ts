/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFile, glob } from '../tools/index.js';
import * as path from 'path';

export interface CodeIssue {
  severity: 'error' | 'warning' | 'info' | 'critical';
  line?: number;
  column?: number;
  message: string;
  rule?: string;
  suggestion?: string;
}

export interface CodeReviewReport {
  timestamp: string;
  file: string;
  issues: CodeIssue[];
  score: number;
  summary: string;
}

export interface FullReviewReport {
  timestamp: string;
  files: CodeReviewReport[];
  totalIssues: number;
  criticalIssues: number;
  warnings: number;
  suggestions: string[];
  score: number;
  recommendations: string[];
}

/**
 * Code Review Agent - analyzes code for bugs, anti-patterns, security issues
 */
export class CodeReviewAgent {
  private rules: Map<string, CodeIssue> = new Map();

  /**
   * Scan single file for issues
   */
  async scanFile(filePath: string): Promise<CodeReviewReport> {
    const issues: CodeIssue[] = [];
    
    try {
      const content = await readFile(filePath);
      const lines = content.split('\n');
      
      // Check for common issues
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        
        // Critical: Hardcoded credentials
        if (line.match(/password\s*=|api[_-]?key\s*=|secret\s*=/i) && 
            !line.match(/process\.env|process\.env|\/\/|\/\*|\*/)) {
          issues.push({
            severity: 'critical',
            line: lineNum,
            message: 'Potential hardcoded credential detected',
            suggestion: 'Use environment variables instead'
          });
        }
        
        // Error: Memory leak - unclosed resources
        if (line.match(/await\s+.*open\(|new\s+.*Stream/i) && 
            !lines.slice(i, i+10).some(l => l.includes('close()'))) {
          issues.push({
            severity: 'warning',
            line: lineNum,
            message: 'Resource may not be properly closed',
            suggestion: 'Ensure resource is closed in finally block'
          });
        }
        
        // Warning: Unhandled promise rejection
        if (line.match(/^[^/]*\basync\s+\w+.*=/i) && 
            !lines.slice(i, i+5).some(l => l.includes('catch') || l.includes('try'))) {
          issues.push({
            severity: 'warning',
            line: lineNum,
            message: 'Unhandled promise - missing error handling',
            suggestion: 'Add try/catch or .catch() handler'
          });
        }
        
        // Warning: SQL injection risk
        if (line.match(/execute\(|query\(|sql/i) && 
            line.match(/['"`]\$\{|['"`]\+\s*\w+/))) {
          issues.push({
            severity: 'critical',
            line: lineNum,
            message: 'Potential SQL injection vulnerability',
            suggestion: 'Use parameterized queries'
          });
        }
        
        // Info: console.log in production
        if (line.match(/console\.(log|debug|info)/i) && 
            !filePath.includes('.test.') && !filePath.includes('.spec.')) {
          issues.push({
            severity: 'info',
            line: lineNum,
            message: 'Console statement in code',
            suggestion: 'Use proper logging library for production'
          });
        }
        
        // Error: Null check missing
        if (line.match(/\.\w+\(/i) && 
            !lines.slice(Math.max(0, i-3), i).some(l => 
              l.includes('if (') || l.includes('?.'))) {
          issues.push({
            severity: 'warning',
            line: lineNum,
            message: 'Potential null/undefined access',
            suggestion: 'Add null check before property access'
          });
        }
        
        // Warning: Infinite loop risk
        if (line.match(/while\s*\(/i) && 
            !line.match(/while\s*\(\s*\w+\.length/i) &&
            !lines.slice(i, i+20).some(l => l.includes('break') || l.includes('return'))) {
          issues.push({
            severity: 'critical',
            line: lineNum,
            message: 'Potential infinite loop',
            suggestion: 'Ensure loop has exit condition'
          });
        }
      }
    } catch (error) {
      issues.push({
        severity: 'error',
        message: `Failed to scan: ${(error as Error).message}`
      });
    }
    
    // Calculate score (100 = perfect, lower = more issues)
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const score = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 5));
    
    return {
      timestamp: new Date().toISOString(),
      file: filePath,
      issues,
      score,
      summary: issues.length > 0 
        ? `${issues.length} issue(s) found`
        : 'No issues detected'
    };
  }

  /**
   * Scan entire project
   */
  async scanProject(projectPath: string): Promise<FullReviewReport> {
    const reports: CodeReviewReport[] = [];
    const allSuggestions: string[] = [];
    
    // Find all code files
    const tsFiles = await glob(`${projectPath}/**/*.ts`);
    const jsFiles = await glob(`${projectPath}/**/*.js`);
    const tsxFiles = await glob(`${projectPath}/**/*.tsx`);
    const files = [...tsFiles, ...jsFiles, ...tsxFiles].slice(0, 100); // Limit
    
    // Scan each file
    for (const file of files) {
      const report = await this.scanFile(file);
      reports.push(report);
      
      // Collect suggestions
      for (const issue of report.issues) {
        if (issue.suggestion) {
          allSuggestions.push(`${path.basename(file)}:${issue.line}: ${issue.suggestion}`);
        }
      }
    }
    
    const totalIssues = reports.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = reports.reduce(
      (sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0
    );
    const warnings = reports.reduce(
      (sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 0
    );
    const avgScore = reports.length > 0 
      ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length)
      : 100;
    
    const recommendations: string[] = [];
    if (criticalIssues > 0) {
      recommendations.push(`Fix ${criticalIssues} critical issue(s) immediately`);
    }
    if (warnings > 0) {
      recommendations.push(`Address ${warnings} warning(s)`);
    }
    if (avgScore < 70) {
      recommendations.push('Code quality needs improvement');
    }
    
    return {
      timestamp: new Date().toISOString(),
      files: reports,
      totalIssues,
      criticalIssues,
      warnings,
      suggestions: allSuggestions,
      score: avgScore,
      recommendations
    };
  }

  /**
   * Analyze runtime error
   */
  async analyzeError(
    stackTrace: string, 
    sourcePath: string
  ): Promise<CodeIssue | null> {
    // Parse stack trace to find cause
    const match = stackTrace.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
    if (!match) return null;
    
    const [, functionName, file, line] = match;
    
    // Read the problematic line
    try {
      const content = await readFile(file);
      const lines = content.split('\n');
      const lineContent = lines[parseInt(line) - 1];
      
      return {
        severity: 'error',
        line: parseInt(line),
        message: `Runtime error in ${functionName}: ${lineContent}`,
        suggestion: 'Analyze and fix the error',
        rule: 'runtime-error'
      };
    } catch {
      return null;
    }
  }

  /**
   * Integrate with ESLint
   */
  async runESLint(projectPath: string): Promise<CodeIssue[]> {
    // Would run: npx eslint . --format json
    const issues: CodeIssue[] = [];
    
    // Placeholder - real implementation would run ESLint
    console.log('[Code Review] Running ESLint on:', projectPath);
    
    return issues;
  }

  /**
   * Integrate with TypeScript compiler
   */
  async runTypeScriptCheck(projectPath: string): Promise<CodeIssue[]> {
    // Would run: npx tsc --noEmit
    const issues: CodeIssue[] = [];
    
    console.log('[Code Review] Running TypeScript check on:', projectPath);
    
    return issues;
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport(review: FullReviewReport): string {
    let report = `# Code Review Report\n\n`;
    report += `**Date:** ${review.timestamp}\n`;
    report += `**Score:** ${review.score}/100\n`;
    report += `**Total Issues:** ${review.totalIssues}\n`;
    report += `**Critical:** ${review.criticalIssues}\n`;
    report += `**Warnings:** ${review.warnings}\n\n`;
    
    report += `## Files Scanned\n`;
    for (const file of review.files) {
      if (file.issues.length > 0) {
        report += `### ${file.file}\n`;
        for (const issue of file.issues) {
          report += `- **[${issue.severity.toUpperCase()}]**`;
          if (issue.line) report += ` Line ${issue.line}:`;
          report += ` ${issue.message}\n`;
          if (issue.suggestion) {
            report += `  > Suggestion: ${issue.suggestion}\n`;
          }
        }
      }
    }
    
    if (review.recommendations.length > 0) {
      report += `\n## Recommendations\n`;
      for (const rec of review.recommendations) {
        report += `- ${rec}\n`;
      }
    }
    
    return report;
  }
}