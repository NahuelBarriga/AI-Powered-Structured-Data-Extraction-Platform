export interface UncertaintyFlags {
  hasPlaceholderData: boolean;
  hasGenericResponses: boolean;
  hasEmptyItems: boolean;
  hasSuspiciousPatterns: boolean;
  uncertainFields: string[];
  confidenceScore: number;
  warnings: string[];
}

export interface Extraction {
  id: string;
  version: number;
  inputText: string;
  extractedData: any;
  status: string;
  model: string;
  attempts: number;
  createdAt: string;
  confidenceScore?: number;
  uncertaintyData?: UncertaintyFlags;
}

export interface ExtractionDisplayProps {
  extraction: Extraction;
  onCopy: () => void;
  copied: boolean;
}