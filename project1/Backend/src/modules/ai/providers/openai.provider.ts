import OpenAI from "openai";
import type{
  LLMProvider,
  LLMRequest,
  LLMResponse,
  StreamEvent,
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

  async *streamGenerate(request: LLMRequest): AsyncGenerator<StreamEvent, void, unknown> {
    let fullContent = "";
    let tokensIn = 0;
    let tokensOut = 0;

    const stream = await this.client.chat.completions.create({
      model: this.model,
      temperature: request.temperature ?? 0,
      max_tokens: request.maxTokens ?? 300,
      stream: true,
      messages: [
        ...(request.systemPrompt
          ? [{ role: "system" as const, content: request.systemPrompt }]
          : []),
        { role: "user" as const, content: request.userPrompt },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const content = delta?.content || "";
      
      if (content) {
        fullContent += content;
        yield {
          token: content,
          isComplete: false,
          fullContent: fullContent,
        };
      }

      // Capture usage tokens if available (only at the end)
      if (chunk.usage) {
        tokensIn = chunk.usage.prompt_tokens;
        tokensOut = chunk.usage.completion_tokens;
      }
    }

    // Yield final event with complete flag and token counts
    yield {
      token: "",
      isComplete: true,
      fullContent: fullContent,
      tokensIn: tokensIn,
      tokensOut: tokensOut,
    };
  }
}
