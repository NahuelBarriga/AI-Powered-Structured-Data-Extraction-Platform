import type { UncertaintyFlags } from "./extraction.types";

export interface ConfidenceBadgeProps {
  uncertainty?: UncertaintyFlags;
  score?: number;
}

export interface ErrorBoxProps {
  message: string;
  onDismiss?: () => void;
}

export interface SessionInfoProps {
  sessionId: string;
  createdAt: string;
}

export interface RefineSectionProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

export interface ExtractionNavigationProps {
  currentIndex: number;
  totalExtractions: number;
  version: number;
  onPrevious: () => void;
  onNext: () => void;
}

export interface ErrorMessageProps {
  message: string;
}

export interface ActionButtonsProps {
  onRetry: () => void;
  onNewExtraction: () => void;
  loading: boolean;
  disabled: boolean;
}
