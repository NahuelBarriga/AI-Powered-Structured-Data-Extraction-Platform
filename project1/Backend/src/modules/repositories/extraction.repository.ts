import { prisma } from "../../infra/db/prisma";

export async function saveExtraction(params: {
  inputText: string;
  extractedData?: unknown;
  confidence?: number;
  attempts: number;
  status: "success" | "failed";
  provider: string;
  model: string;
}) {
  return prisma.aIExtraction.create({
    data: {
      inputText: params.inputText,
      extractedData: params.extractedData ?? {},
      confidence: params.confidence ?? 0,
      attempts: params.attempts,
      status: params.status,
      provider: params.provider,
      model: params.model,
    },
  });
}
