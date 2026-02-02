import type { Extraction } from "./extraction.types";

export interface SessionData {
  session: {
    id: string;
    createdAt: string;
  };
  extractions: Extraction[];
  totalExtractions: number;
}
