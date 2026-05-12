/**
 * @license
 * Copyright 2026 ZERO Agent Team
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CommandModule } from 'yargs';
import { createDebugLogger } from '@zero-agent/zero-core';

const debugLogger = createDebugLogger('HOOKS_UI');

export const hooksCommand: CommandModule = {
  command: 'hooks',
  aliases: ['hook'],
  describe: 'Manage ZERO Agent hooks (use /hooks in interactive mode).',
  builder: (yargs) => yargs.version(false).help(false),
  handler: () => {
    // In CLI mode, this command is not interactive.
    // Users should use /hooks in interactive mode for the full UI experience.
    debugLogger.debug(
      'Use /hooks in interactive mode to manage hooks with the UI.',
    );
    process.exit(0);
  },
};
