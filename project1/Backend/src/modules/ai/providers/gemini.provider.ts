import type {
    LLMProvider,
    LLMRequest,
    LLMResponse,
} from "./llmProvider.type";

export class GeminiProvider implements LLMProvider {
    private apiKey: string;
    private model: string;
    private baseUrl =
        "https://generativelanguage.googleapis.com/v1beta/models";

    constructor(apiKey: string, model: string) {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(request: LLMRequest): Promise<LLMResponse> {
        const res = await fetch(
            `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        ...(request.systemPrompt
                            ? [
                                {
                                    role: "user",
                                    parts: [{ text: request.systemPrompt }],
                                },
                            ]
                            : []),
                        {
                            role: "user",
                            parts: [{ text: request.userPrompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: request.temperature ?? 0,
                        maxOutputTokens: request.maxTokens ?? 300,
                    },
                }),
            }
        );

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Gemini API error: ${error}`);
        }

        const data = await res.json();

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        return {
            content: text,
            model: this.model,
            provider: "gemini",
            tokensIn: data.usageMetadata?.promptTokenCount ?? 0,
            tokensOut: data.usageMetadata?.candidatesTokenCount ?? 0,
        };
    }
}
