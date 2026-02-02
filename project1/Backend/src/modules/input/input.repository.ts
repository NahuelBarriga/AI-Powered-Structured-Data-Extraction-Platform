import { JsonObject } from "@prisma/client/runtime/library";
import { prisma } from "../../infra/db/prisma";
import type { UncertaintyFlags } from "../../shared/types/ai.types";

export async function saveExtraction(params: {
  userId: string;
  inputText: string;
  extractedData?: JsonObject; 
  attempts: number;
  status: "success" | "failed";
  provider: string;
  model: string;
  sessionId: string;
  version: number;
  tokensIn?: number;
  tokensOut?: number;
  uncertainty?: UncertaintyFlags | null;
}) {
  return prisma.aIExtraction.create({
    data: {
      userId: params.userId,
      inputText: params.inputText,
      extractedData: params.extractedData ?? {},
      attempts: params.attempts,
      status: params.status,
      model: params.model,
      sessionId: params.sessionId,
      version: params.version,
      tokensIn: params.tokensIn ?? 0,
      tokenOut: params.tokensOut ?? 0,
      confidenceScore: params.uncertainty?.confidenceScore ?? null,
      uncertaintyData: params.uncertainty ? JSON.parse(JSON.stringify(params.uncertainty)) : null,
    },
  });
}

