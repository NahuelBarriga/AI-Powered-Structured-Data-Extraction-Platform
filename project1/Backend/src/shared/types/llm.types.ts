export interface LLMRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokensIn?: number;
  tokensOut?: number;
}

export interface StreamEvent {
  token: string;
  isComplete: boolean;
  fullContent?: string;
  tokensIn?: number;
  tokensOut?: number;
}

export interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
  streamGenerate?(request: LLMRequest): AsyncGenerator<StreamEvent, void, unknown>;
}
