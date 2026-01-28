export interface LLMRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokensIn?: number;
  tokensOut?: number;
}

export interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
