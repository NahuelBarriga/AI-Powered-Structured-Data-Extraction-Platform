export interface StreamingEvent {
  type: "token" | "preview" | "complete" | "error" | "saved";
  content?: string;
  fullContent?: string;
  result?: any;
  error?: string;
  extractionId?: string;
  sessionId?: string;
}

export interface StreamingState {
  tokens: string;
  fullContent: string;
  preview: any | null;
  validationError: string | null;
  extractionId: string | null;
  sessionId: string | null;
}

export interface StreamingInputFormProps {
  placeholder?: string;
}
