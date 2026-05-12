/**
 * @license
 * Copyright 2026 ZERO Agent Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { SUPPORTED_IMAGE_MIME_TYPES } from '@zero-agent/zero-core/src/utils/request-tokenizer/supportedImageFormats.js';
import { SUPPORTED_PASTED_IMAGE_MIME_TYPES } from './imageSupport.js';

describe('imageSupport constants', () => {
  it('keeps the browser-safe pasted image list aligned with core-supported formats', () => {
    expect(SUPPORTED_PASTED_IMAGE_MIME_TYPES).toEqual(
      new Set(SUPPORTED_IMAGE_MIME_TYPES),
    );
  });
});
