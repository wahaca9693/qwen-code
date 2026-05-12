/**
 * @license
 * Copyright 2026 ZERO Agent Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared utility functions for tool call components
 * Now re-exports from @zero/webui for backward compatibility
 */

export {
  extractCommandOutput,
  formatValue,
  safeTitle,
  shouldShowToolCall,
  groupContent,
  hasToolCallOutput,
  mapToolStatusToContainerStatus,
} from '@zero/webui';

// Re-export types for backward compatibility
export type {
  ToolCallContent,
  GroupedContent,
  ToolCallData,
  ToolCallStatus,
} from '@zero/webui';
