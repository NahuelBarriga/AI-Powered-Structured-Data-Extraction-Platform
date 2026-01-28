export interface PromptBuildInput {
  schemaName: string;
  schemaDescription?: string;
  jsonSchema: object;
  inputText: string;
  lastExtraction?: string;
  inputMode?: 'new' | 'retry' | 'refine';
}

export interface BuiltPrompt {
  system: string;
  user: string;
}
