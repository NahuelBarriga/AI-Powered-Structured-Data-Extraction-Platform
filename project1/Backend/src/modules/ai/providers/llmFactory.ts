import type { LLMProvider } from "../providers/llmProvider";
import { OpenAIProvider } from "../providers/openai.provider";
import { MockLLMProvider } from "./mockProvider";

export function createLLMProvider(): LLMProvider {
    const provider = process.env.LLM_PROVIDER ?? "mock"; //todo: modify to only .env or config file

    switch (provider) {
        case "openai":
            return new OpenAIProvider(
                process.env.OPENAI_API_KEY!,
                process.env.OPENAI_MODEL ?? "gpt-4o-mini" //todo: modify too
            );
        case "mock":
            return new MockLLMProvider();
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }

}
