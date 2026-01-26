export interface PromptBuildInput {
  schemaName: string;
  schemaDescription?: string;
  jsonSchema: object;
  inputText: string;
}

export interface BuiltPrompt {
  version: string;
  system: string;
  user: string;
}
