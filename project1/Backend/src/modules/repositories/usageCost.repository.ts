import { prisma } from "../../infra/db/prisma";

export async function createUsageCost(params: {
  userId: string;
  sessionId?: string;
  extractionId?: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}) {
  return prisma.usageCost.create({
    data: {
      userId: params.userId,
      sessionId: params.sessionId ?? null,
      extractionId: params.extractionId ?? null,
      model: params.model,
      tokensIn: params.tokensIn,
      tokensOut: params.tokensOut,
    },
  });
}

// Get total tokens used by a user in the last hour
export async function getUserTokenUsageLastHour(userId: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const result = await prisma.usageCost.aggregate({
    where: {
      userId: userId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
    _sum: {
      tokensIn: true,
      tokensOut: true,
    },
  });

  const totalTokens = (result._sum.tokensIn ?? 0) + (result._sum.tokensOut ?? 0);
  return totalTokens;
}

// Check if user can make a request based on token limits
export async function checkUserTokenLimit(
  userId: string,
  estimatedTokens: number,
  maxTokensPerUser: number
): Promise<{ allowed: boolean; currentUsage: number; limit: number }> {
  const currentUsage = await getUserTokenUsageLastHour(userId);
  const allowed = currentUsage + estimatedTokens <= maxTokensPerUser;
  
  return {
    allowed,
    currentUsage,
    limit: maxTokensPerUser,
  };
}
