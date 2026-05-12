/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const SERVICE_NAME = 'zero';

export const EVENT_USER_PROMPT = 'zero.user_prompt';
export const EVENT_USER_RETRY = 'zero.user_retry';
export const EVENT_TOOL_CALL = 'zero.tool_call';
export const EVENT_API_REQUEST = 'zero.api_request';
export const EVENT_API_ERROR = 'zero.api_error';
export const EVENT_API_CANCEL = 'zero.api_cancel';
export const EVENT_API_RESPONSE = 'zero.api_response';
export const EVENT_CLI_CONFIG = 'zero.config';
export const EVENT_EXTENSION_DISABLE = 'zero.extension_disable';
export const EVENT_EXTENSION_ENABLE = 'zero.extension_enable';
export const EVENT_EXTENSION_INSTALL = 'zero.extension_install';
export const EVENT_EXTENSION_UNINSTALL = 'zero.extension_uninstall';
export const EVENT_EXTENSION_UPDATE = 'zero.extension_update';
export const EVENT_FLASH_FALLBACK = 'zero.flash_fallback';
export const EVENT_RIPGREP_FALLBACK = 'zero.ripgrep_fallback';
export const EVENT_NEXT_SPEAKER_CHECK = 'zero.next_speaker_check';
export const EVENT_SLASH_COMMAND = 'zero.slash_command';
export const EVENT_IDE_CONNECTION = 'zero.ide_connection';
export const EVENT_CHAT_COMPRESSION = 'zero.chat_compression';
export const EVENT_INVALID_CHUNK = 'zero.chat.invalid_chunk';
export const EVENT_CONTENT_RETRY = 'zero.chat.content_retry';
export const EVENT_CONTENT_RETRY_FAILURE =
  'zero.chat.content_retry_failure';
export const EVENT_CONVERSATION_FINISHED = 'zero.conversation_finished';
export const EVENT_MALFORMED_JSON_RESPONSE =
  'zero.malformed_json_response';
export const EVENT_FILE_OPERATION = 'zero.file_operation';
export const EVENT_MODEL_SLASH_COMMAND = 'zero.slash_command.model';
export const EVENT_SUBAGENT_EXECUTION = 'zero.subagent_execution';
export const EVENT_SKILL_LAUNCH = 'zero.skill_launch';
export const EVENT_AUTH = 'zero.auth';
export const EVENT_USER_FEEDBACK = 'zero.user_feedback';

// Prompt Suggestion Events
export const EVENT_PROMPT_SUGGESTION = 'zero.prompt_suggestion';
export const EVENT_SPECULATION = 'zero.speculation';

// Arena Events
export const EVENT_ARENA_SESSION_STARTED = 'zero.arena_session_started';
export const EVENT_ARENA_AGENT_COMPLETED = 'zero.arena_agent_completed';
export const EVENT_ARENA_SESSION_ENDED = 'zero.arena_session_ended';

// Performance Events
export const EVENT_STARTUP_PERFORMANCE = 'zero.startup.performance';
export const EVENT_MEMORY_USAGE = 'zero.memory.usage';
export const EVENT_PERFORMANCE_BASELINE = 'zero.performance.baseline';
export const EVENT_PERFORMANCE_REGRESSION = 'zero.performance.regression';

// Managed Auto-Memory Events
export const EVENT_MEMORY_EXTRACT = 'zero.memory.extract';
export const EVENT_MEMORY_DREAM = 'zero.memory.dream';
export const EVENT_MEMORY_RECALL = 'zero.memory.recall';

// Session Tracing Span Names
export const SPAN_INTERACTION = 'zero.interaction';
export const SPAN_LLM_REQUEST = 'zero.llm_request';
export const SPAN_TOOL = 'zero.tool';
export const SPAN_TOOL_EXECUTION = 'zero.tool.execution';
