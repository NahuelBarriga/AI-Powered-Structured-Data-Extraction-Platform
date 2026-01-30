import { prisma } from "../../infra/db/prisma";
import type { AIExtraction, ExtractionSession } from "@prisma/client";

export interface CreateSessionInput {
  userId: string;
}


//  Create a new extraction session for a user
export async function createSession(
  input: CreateSessionInput
): Promise<ExtractionSession> {
  return await prisma.extractionSession.create({
    data: {
      userId: input.userId,
    },
  });
}


//Get the last extraction from a specific session
export async function getLastExtractionFromSession(
  sessionId: string
): Promise<AIExtraction | null> {
  return await prisma.aIExtraction.findFirst({
    where: {
      sessionId: sessionId,
    },
    orderBy: {
      version: "desc",
    },
  });
}
