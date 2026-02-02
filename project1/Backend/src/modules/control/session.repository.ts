import { prisma } from "../../infra/db/prisma";
import type { AIExtraction, ExtractionSession } from "@prisma/client";
import type { CreateSessionInput } from "../../shared/types/control.types";


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
  // First, get the session to check lastExtractionId
  const session = await prisma.extractionSession.findUnique({
    where: { id: sessionId },
    select: { lastExtractionId: true },
  });

  if (!session || !session.lastExtractionId) {
    return null;
  }

  // Fetch the last extraction using lastExtractionId
  return await prisma.aIExtraction.findUnique({
    where: {
      id: session.lastExtractionId,
    },
  });
}

// Update session's lastExtractionId after saving an extraction
export async function updateSessionLastExtraction(
  sessionId: string,
  extractionId: string
): Promise<ExtractionSession> {
  return await prisma.extractionSession.update({
    where: {
      id: sessionId,
    },
    data: {
      lastExtractionId: extractionId,
    },
  });
}

// Get session with all extractions
export async function getSessionWithExtractions(sessionId: string) {
  return await prisma.extractionSession.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      extractions: {
        orderBy: {
          version: "asc",
        },
      },
    },
  });
}
