import type {
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from "./llmProvider";

export class MockLLMProvider implements LLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    
    // console.log(request.userPrompt); //!remove

    return {
      provider: "mock",
      model: "mock-model",
      content: JSON.stringify({
        items: [
          {
            name: "Cappuccino",
            quantity: 2,
            modifiers: "with oat milk",
          },
          {
            name: "Croissant",
            quantity: 1,
            modifiers: null,
          },
        ],
        notes: "No sugar",
      }),
    };
  }
}
