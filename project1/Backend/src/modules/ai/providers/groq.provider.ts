import type {
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from "./llmProvider.type";

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor(apiKey: string, model = "llama-3.1-8b-instant") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: request.temperature ?? 0,
        messages: [
          ...(request.systemPrompt
            ? [{ role: "system", content: request.systemPrompt }]
            : []),
          { role: "user", content: request.userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await res.json();

    return {
      content: data.choices?.[0]?.message?.content ?? "",
      model: this.model,
      provider: "groq",
      tokensIn: data.usage?.prompt_tokens ?? 0,
      tokensOut: data.usage?.completion_tokens ?? 0,
    };
  }
}
