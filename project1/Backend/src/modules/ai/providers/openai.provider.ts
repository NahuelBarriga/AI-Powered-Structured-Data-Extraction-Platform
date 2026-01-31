import OpenAI from "openai";
import type{
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from "./llmProvider.type";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: request.temperature ?? 0,
      max_tokens: request.maxTokens ?? 300,
      messages: [
        ...(request.systemPrompt
          ? [{ role: "system" as const, content: request.systemPrompt }]
          : []),
        { role: "user" as const, content: request.userPrompt },
      ],
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
      model: this.model,
      provider: "openai",
      tokensIn: completion.usage?.prompt_tokens ?? 0,
      tokensOut: completion.usage?.completion_tokens ?? 0,
    };
  }
}
