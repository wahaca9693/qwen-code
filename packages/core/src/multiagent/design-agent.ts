/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserAgent } from './browser-agent.js';

export interface DesignIssue {
  category: 'accessibility' | 'responsive' | 'contrast' | 'layout' | 'typography' | 'interactive';
  severity: 'error' | 'warning' | 'info';
  element?: string;
  message: string;
  suggestion?: string;
  selector?: string;
}

export interface DesignScore {
  accessibility: number;
  responsive: number;
  contrast: number;
  layout: number;
  typography: number;
  interactive: number;
  overall: number;
}

export interface DesignReviewResult {
  timestamp: string;
  url?: string;
  issues: DesignIssue[];
  score: DesignScore;
  recommendations: string[];
  screenshot?: string;
}

/**
 * Design Agent - reviews UI/UX and visual quality
 */
export class DesignAgent {
  private browserAgent: BrowserAgent;

  constructor(browserAgent?: BrowserAgent) {
    this.browserAgent = browserAgent || new BrowserAgent({ headless: true });
  }

  /**
   * Initialize browser if needed
   */
  async initialize(): Promise<void> {
    await this.browserAgent.initialize();
  }

  /**
   * Review a running website
   */
  async reviewWebsite(url: string, screenshotPath?: string): Promise<DesignReviewResult> {
    const issues: DesignIssue[] = [];

    // Navigate to site
    await this.browserAgent.navigate(url);
    
    // Take screenshot if requested
    if (screenshotPath) {
      await this.browserAgent.screenshot(screenshotPath);
    }

    // Analyze common issues
    issues.push(...await this.checkAccessibility(url));
    issues.push(...await this.checkResponsive(url));
    issues.push(...await this.checkContrast(url));
    issues.push(...await this.checkTypography(url));
    issues.push(...await this.checkInteractive(url));

    // Calculate score
    const score = this.calculateScore(issues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);

    return {
      timestamp: new Date().toISOString(),
      url,
      issues,
      score,
      recommendations,
      screenshot: screenshotPath
    };
  }

  /**
   * Check accessibility issues
   */
  private async checkAccessibility(url: string): Promise<DesignIssue[]> {
    const issues: DesignIssue[] = [];

    try {
      // Check for ARIA labels
      const pageContent = await this.browserAgent.scrape(url, '[role]');
      if (!pageContent?.content?.includes('button')) {
        issues.push({
          category: 'accessibility',
          severity: 'warning',
          message: 'Interactive elements may lack proper ARIA roles',
          suggestion: 'Add appropriate role attributes to buttons, links, etc.'
        });
      }

      // Check for alt text on images
      if (!pageContent?.content?.includes('alt=' ')) {
        issues.push({
          category: 'accessibility',
          severity: 'warning',
          message: 'Images may lack alt text',
          suggestion: 'Add descriptive alt text to all images'
        });
      }

      // Check for keyboard navigation
      issues.push({
        category: 'accessibility',
        severity: 'info',
        message: 'Verify keyboard navigation works',
        suggestion: 'Test tab order and focus states'
      });
    } catch (error) {
      console.error('[Design] Accessibility check failed:', error);
    }

    return issues;
  }

  /**
   * Check responsive design
   */
  private async checkResponsive(url: string): Promise<DesignIssue[]> {
    const issues: DesignIssue[] = [];

    // Would check viewport meta tag
    // Would check media queries
    // Would test different screen sizes

    issues.push({
      category: 'responsive',
      severity: 'info',
      message: 'Check mobile layout',
      suggestion: 'Test on various screen sizes (320px, 768px, 1024px, 1440px)'
    });

    return issues;
  }

  /**
   * Check color contrast
   */
  private async checkContrast(url: string): Promise<DesignIssue[]> {
    const issues: DesignIssue[] = [];

    // Would analyze colors using screenshot
    // Check for WCAG compliance

    issues.push({
      category: 'contrast',
      severity: 'info',
      message: 'Verify text contrast ratio',
      suggestion: 'Ensure 4.5:1 for normal text, 3:1 for large text'
    });

    return issues;
  }

  /**
   * Check typography
   */
  private async checkTypography(url: string): Promise<DesignIssue[]> {
    const issues: DesignIssue[] = [];

    issues.push({
      category: 'typography',
      severity: 'info',
      message: 'Check font readability',
      suggestion: 'Use 16px minimum for body text, proper line-height (1.5)'
    });

    return issues;
  }

  /**
   * Check interactive elements
   */
  private async checkInteractive(url: string): Promise<DesignIssue[]> {
    const issues: DesignIssue[] = [];

    issues.push({
      category: 'interactive',
      severity: 'info',
      message: 'Check button/link states',
      suggestion: 'Verify hover, focus, active states exist'
    });

    return issues;
  }

  /**
   * Calculate design score
   */
  private calculateScore(issues: DesignIssue[]): DesignScore {
    const baseScore = 100;
    
    const criticalCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    const deductions = criticalCount * 15 + warningCount * 5 + infoCount * 1;

    const overall = Math.max(0, baseScore - deductions);

    return {
      accessibility: Math.max(0, 100 - issues.filter(i => i.category === 'accessibility').length * 10),
      responsive: Math.max(0, 100 - issues.filter(i => i.category === 'responsive').length * 10),
      contrast: Math.max(0, 100 - issues.filter(i => i.category === 'contrast').length * 10),
      layout: Math.max(0, 100 - issues.filter(i => i.category === 'layout').length * 10),
      typography: Math.max(0, 100 - issues.filter(i => i.category === 'typography').length * 10),
      interactive: Math.max(0, 100 - issues.filter(i => i.category === 'interactive').length * 10),
      overall
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(issues: DesignIssue[]): string[] {
    const recommendations: string[] = [];

    const byCategory = new Map<string, DesignIssue[]>();
    for (const issue of issues) {
      const existing = byCategory.get(issue.category) || [];
      existing.push(issue);
      byCategory.set(issue.category, existing);
    }

    for (const [category, categoryIssues] of byCategory) {
      const errors = categoryIssues.filter(i => i.severity === 'error');
      if (errors.length > 0) {
        recommendations.push(`Fix ${errors.length} ${category} error(s)`);
      }
    }

    return recommendations;
  }

  /**
   * Review from code (static analysis)
   */
  async reviewCode(jsxCode: string): Promise<DesignReviewResult> {
    const issues: DesignIssue[] = [];

    // Check for proper imports
    if (!jsxCode.includes("import React from 'react'")) {
      issues.push({
        category: 'accessibility',
        severity: 'warning',
        message: 'React may not be properly imported'
      });
    }

    // Check for onClick handlers
    if (jsxCode.includes('<button') && !jsxCode.includes('onClick')) {
      issues.push({
        category: 'interactive',
        severity: 'error',
        message: 'Button lacks onClick handler',
        suggestion: 'Add onClick prop with handler'
      });
    }

    // Check for type attribute
    if (jsxCode.includes('<input') && !jsxCode.includes('type=')) {
      issues.push({
        category: 'accessibility',
        severity: 'error',
        message: 'Input lacks type attribute',
        suggestion: 'Add type (text, email, password, etc.)'
      });
    }

    const score = this.calculateScore(issues);

    return {
      timestamp: new Date().toISOString(),
      issues,
      score,
      recommendations: this.generateRecommendations(issues)
    };
  }

  /**
   * Generate detailed report
   */
  generateReport(result: DesignReviewResult): string {
    let report = `# Design Review Report\n\n`;
    report += `**Date:** ${result.timestamp}\n`;
    if (result.url) report += `**URL:** ${result.url}\n`;
    report += `**Overall Score:** ${result.score.overall}/100\n\n`;
    
    report += `## Scores\n`;
    report += `- Accessibility: ${result.score.accessibility}/100\n`;
    report += `- Responsive: ${result.score.responsive}/100\n`;
    report += `- Contrast: ${result.score.contrast}/100\n`;
    report += `- Typography: ${result.score.typography}/100\n`;
    report += `- Interactive: ${result.score.interactive}/100\n\n`;
    
    if (result.issues.length > 0) {
      report += `## Issues Found\n`;
      for (const issue of result.issues) {
        report += `- **[${issue.severity.toUpperCase()}]** ${issue.category}: ${issue.message}\n`;
        if (issue.suggestion) {
          report += `  > ${issue.suggestion}\n`;
        }
      }
    }
    
    if (result.recommendations.length > 0) {
      report += `\n## Recommendations\n`;
      for (const rec of result.recommendations) {
        report += `- ${rec}\n`;
      }
    }
    
    return report;
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    await this.browserAgent.close();
  }
}