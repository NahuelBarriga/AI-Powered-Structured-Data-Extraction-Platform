import type { LLMProvider } from "../providers/llmProvider";
import { OpenAIProvider } from "../providers/openai.provider";
import { MockLLMProvider } from "./mockProvider";
import { LLM_PROVIDER, OPENAI_API_KEY, OPENAI_MODEL } from "../../../config/LLMConfig";

export function createLLMProvider(): LLMProvider {
    const provider = LLM_PROVIDER;

    switch (provider) {
        case "openai":
            return new OpenAIProvider(
                OPENAI_API_KEY!,
                OPENAI_MODEL || "gpt-3.5-turbo", 
            );
        case "mock":
            return new MockLLMProvider();
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }

}
