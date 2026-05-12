/**
 * @license
 * Copyright 2026 ZERO Agent
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileOperationResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface SearchResult {
  path: string;
  matches: string[];
}

/**
 * File System Agent - manages files and directories
 */
export class FileSystemAgent {
  private gitignorePatterns: Set<string> = new Set();

  constructor() {
    this.loadGitignore();
  }

  private async loadGitignore(): Promise<void> {
    try {
      const content = await fs.readFile('.gitignore', 'utf-8');
      content.split('\n').forEach(pattern => {
        if (pattern && !pattern.startsWith('#')) {
          this.gitignorePatterns.add(pattern);
        }
      });
      
      // Add common sensitive patterns
      this.gitignorePatterns.add('.env');
      this.gitignorePatterns.add('*.key');
      this.gitignorePatterns.add('secrets.json');
      this.gitignorePatterns.add('credentials.json');
    } catch {
      // .gitignore doesn't exist, use defaults
    }
  }

  /**
   * Check if path should be ignored
   */
  shouldIgnore(filePath: string): boolean {
    const basename = path.basename(filePath);
    return this.gitignorePatterns.has(basename);
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Create file
   */
  async createFile(filePath: string, content: string = ''): Promise<FileOperationResult> {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Read file
   */
  async readFile(filePath: string): Promise<FileOperationResult & { content?: string }> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, path: filePath, content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      if (!this.shouldIgnore(filePath)) {
        await fs.unlink(filePath);
        return { success: true, path: filePath };
      }
      return { success: false, error: 'File matches .gitignore pattern' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Delete directory
   */
  async deleteDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      await fs.rm(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(dirPath: string): Promise<FileOperationResult & { files?: string[] }> {
    try {
      const entries = await fs.readdir(dirPath);
      return { 
        success: true, 
        path: dirPath, 
        files: entries.map(e => path.join(dirPath, e))
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Copy file
   */
  async copyFile(source: string, destination: string): Promise<FileOperationResult> {
    try {
      const dir = path.dirname(destination);
      await fs.mkdir(dir, { recursive: true });
      await fs.copyFile(source, destination);
      return { success: true, path: destination };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Move/rename file
   */
  async moveFile(source: string, destination: string): Promise<FileOperationResult> {
    try {
      await fs.rename(source, destination);
      return { success: true, path: destination };
    } catch (error) {
      // Try copy + delete if rename fails (different filesystems)
      try {
        await fs.copyFile(source, destination);
        await fs.unlink(source);
        return { success: true, path: destination };
      } catch {
        return { success: false, error: (error as Error).message };
      }
    }
  }

  /**
   * Search for files by pattern
   */
  async glob(pattern: string): Promise<string[]> {
    // Simple glob implementation
    const results: string[] = [];
    
    const walk = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (this.shouldIgnore(fullPath)) continue;
          
          // Match pattern
          const regex = new RegExp(
            pattern
              .replace(/\./g, '\\.')
              .replace(/\*/g, '.*')
              .replace(/\?/g, '.')
          );
          
          if (regex.test(entry.name)) {
            results.push(fullPath);
          }
          
          if (entry.isDirectory()) {
            await walk(fullPath);
          }
        }
      } catch {}
    };
    
    await walk(process.cwd());
    return results;
  }

  /**
   * Search for string in files
   */
  async searchInFiles(
    directory: string, 
    searchString: string,
    extensions: string[] = ['.ts', '.js', '.tsx', '.jsx', '.json']
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    const search = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (this.shouldIgnore(fullPath)) continue;
          
          if (entry.isDirectory()) {
            await search(fullPath);
          } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            const content = await fs.readFile(fullPath, 'utf-8');
            const matches: string[] = [];
            
            content.split('\n').forEach((line, i) => {
              if (line.toLowerCase().includes(searchString.toLowerCase())) {
                matches.push(`Line ${i + 1}: ${line.trim()}`);
              }
            });
            
            if (matches.length > 0) {
              results.push({ path: fullPath, matches });
            }
          }
        }
      } catch {}
    };
    
    await search(directory);
    return results;
  }

  /**
   * Watch file for changes
   */
  async watchFile(
    filePath: string, 
    callback: (event: string) => void
  ): Promise<() => void> {
    const watcher = await fs.watch(filePath, (eventType) => {
      callback(eventType);
    });
    
    // Return cleanup function
    return () => watcher.close();
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath: string): Promise<FileOperationResult & {
    size?: number;
    created?: Date;
    modified?: Date;
  }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        success: true,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}