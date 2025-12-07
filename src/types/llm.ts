/**
 * Local LLM Assistant TypeScript Interfaces
 *
 * Defines types for the local LLM assistant feature (P4):
 * - LLMRequest: Query sent to local LLM with context
 * - LLMResponse: Response received from local LLM
 * - LLMConfig: Configuration for LLM connection
 * - LLMConversation: Session history for multi-turn conversations
 *
 * @see plan.md - Data model phase 1 design
 * @see research.md - LLM integration via LM Studio or Ollama
 */

import { ChapterReference } from './search';
import { SearchResult } from './search';

/**
 * Configuration for local LLM connection
 * Supports both LM Studio and Ollama via REST APIs
 */
export interface LLMConfig {
  /** Type of LLM provider */
  provider: 'lm-studio' | 'ollama';
  /** Base URL for API calls (e.g., "http://localhost:1234/v1" for LM Studio) */
  baseURL: string;
  /** Model name to use (e.g., "local-model" for LM Studio, "neural-chat" for Ollama) */
  modelName?: string;
  /** Maximum tokens in response (default: 2048) */
  maxTokens?: number;
  /** Temperature for generation (0-1, default: 0.7) */
  temperature?: number;
  /** Connection timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
}

/**
 * Context provided to LLM for generating responses
 * Includes relevant chapter, search results, and user annotations
 */
export interface LLMContext {
  /** Currently viewing this chapter */
  currentChapter?: ChapterReference;
  /** Visible search results (if any) */
  searchResults?: SearchResult[];
  /** User's annotations on relevant chapters */
  annotations?: Array<{
    chapter: ChapterReference;
    note: string;
    tags?: {
      weapons?: string[];
      guards?: string[];
      techniques?: string[];
    };
  }>;
}

/**
 * Request to send to local LLM
 * Contains user message and context for generating response
 */
export interface LLMRequest {
  /** The user's question or prompt */
  prompt: string;
  /** Contextual information for the LLM */
  context: LLMContext;
  /** Maximum tokens in response (overrides config default) */
  maxTokens?: number;
  /** Temperature for generation (overrides config default) */
  temperature?: number;
}

/**
 * Response received from local LLM
 * Includes generated text and metadata
 */
export interface LLMResponse {
  /** The generated response text */
  text: string;
  /** Which model generated this response */
  model: string;
  /** Approximate number of tokens used */
  tokensUsed?: number;
  /** How long generation took (milliseconds) */
  generationTimeMs?: number;
  /** Whether response was complete or truncated */
  complete: boolean;
}

/**
 * Single turn in a conversation with the LLM
 */
export interface LLMMessage {
  /** "user" or "assistant" */
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** Timestamp of message */
  timestamp: Date;
}

/**
 * Conversation session with the LLM
 * Maintains context across multiple turns
 */
export interface LLMConversation {
  /** Unique conversation ID */
  id: string;
  /** Conversation history (messages in order) */
  messages: LLMMessage[];
  /** Current context (chapter, search results, annotations) */
  context: LLMContext;
  /** When conversation started */
  startedAt: Date;
  /** Whether the LLM is currently generating a response */
  isGenerating: boolean;
  /** Error message if last request failed */
  lastError?: string;
}

/**
 * Browser localStorage schema for LLM conversations
 */
export interface LLMConversationStorage {
  version: number;
  conversations: LLMConversationStorageEntry[];
  lastUpdated: string; // ISO 8601 date string
}

/**
 * Internal: Single conversation as stored in localStorage (with date strings)
 */
export interface LLMConversationStorageEntry {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string; // ISO 8601 date string
  }>;
  startedAt: string; // ISO 8601 date string
}

/**
 * Error from LLM connection or processing
 */
export interface LLMError {
  code: 'connection-failed' | 'timeout' | 'model-not-found' | 'generation-error' | 'unknown';
  message: string;
  details?: Record<string, unknown>;
}
