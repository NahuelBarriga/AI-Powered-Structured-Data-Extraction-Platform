import type { Order } from "../../modules/ai/schemas/order.schema";

export interface UncertaintyFlags {
  hasPlaceholderData: boolean;
  hasGenericResponses: boolean;
  hasEmptyItems: boolean;
  hasSuspiciousPatterns: boolean;
  uncertainFields: string[];
  confidenceScore: number; // 0-100
  warnings: string[];
  schemaCompliance: number; // 0-100 (NEW)
  retryPenalty: number; // penalty from retries (NEW)
  tokenBehavior: number; // signal from token efficiency (NEW)
}

export interface ExtractionResult {
  order: Order;
  tokensIn: number;
  tokensOut: number;
  model: string;
  uncertainty?: UncertaintyFlags;
  retries?: number;
}

export interface StreamingExtractionResult {
  order: Order;
  tokensIn: number;
  tokensOut: number;
  model: string;
  uncertainty?: UncertaintyFlags;
  validationError?: string;
}
