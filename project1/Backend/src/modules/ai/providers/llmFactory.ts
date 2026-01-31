import type { LLMProvider } from "./llmProvider.type";
import { OpenAIProvider } from "../providers/openai.provider";
import { MockLLMProvider } from "./mockProvider";
import { LLM_PROVIDER, OPENAI_API_KEY, OPENAI_MODEL, GEMINI_API_KEY, GEMINI_MODEL, GROQ_API_KEY, GROQ_MODEL} from "../../../config/LLMConfig";
import { GeminiProvider } from "./gemini.provider";
import { GroqProvider } from "./groq.provider";

export function createLLMProvider(): LLMProvider {
    const provider = LLM_PROVIDER;
    console.log(`Creating LLM Provider: ${provider}`); //!debug
    switch (provider) {
        case 'groq':
            return new GroqProvider(
                GROQ_API_KEY!,
                GROQ_MODEL!
            );
        case "gemini":
            return new GeminiProvider(
                GEMINI_API_KEY!,
                GEMINI_MODEL!
            );
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
