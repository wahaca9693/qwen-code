/**
 * @license
 * Copyright 2026 ZERO Agent Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Main ToolCall component - uses factory pattern to route to specialized components
 *
 * This file serves as the public API for tool call rendering.
 * It re-exports the router and types from the toolcalls module.
 */

import type { FC } from 'react';
import type { ToolCallData } from '@zero/webui';
import { ToolCallRouter } from './index.js';

// Re-export types from webui for backward compatibility
export type {
  ToolCallData,
  BaseToolCallProps as ToolCallProps,
  ToolCallContent,
} from '@zero/webui';

export const ToolCall: FC<{
  toolCall: ToolCallData;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ toolCall, isFirst, isLast }) => (
  <ToolCallRouter toolCall={toolCall} isFirst={isFirst} isLast={isLast} />
);
