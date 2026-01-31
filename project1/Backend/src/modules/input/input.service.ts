
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import { ErrorResponseDTO, OrderCreateDTO, SuccessResponseDTO } from "../../shared/DTO/resDTO";
import { ExtractionError } from "../../shared/Errors/extractionError";
import { extractOrderFromText, calculateTokens } from "../ai/ai.service";
import { saveExtraction } from "./input.repository";
import { createSession, getLastExtractionFromSession, getSessionWithExtractions } from "../control/session.repository";
import { checkUserTokenLimit, createUsageCost } from "../control/usageCost.repository";
import { th } from "zod/v4/locales";
import { createLLMProvider } from "../ai/providers/llmFactory";

const max_Retries = process.env.VITE_MAX_RETRIES
    ? parseInt(process.env.VITE_MAX_RETRIES)
    : 3;

const MAX_TOKENS_PER_USER = process.env.MAX_TOKENS_PER_USER
    ? parseInt(process.env.MAX_TOKENS_PER_USER)
    : 10000;

export async function inputService(order: ReqOrderDTO, userId: string) {
    let attempt = 1;
    let version = 1;
    let lastExtraction = null;

    if (!order.sessionId) { //create session if not provided
        const session = await createSession({ userId: userId });
        order.sessionId = session.id;
    } else { //obtain last extraction and increment version 
        lastExtraction = await getLastExtractionFromSession(order.sessionId);
        if (lastExtraction) {
            version = lastExtraction.version + 1;
        }
    }

    // Estimate tokens for the input
    const estimatedTokens = calculateTokens(order.text);

    // Check if user has enough token quota
    const tokenCheck = await checkUserTokenLimit(userId, estimatedTokens, MAX_TOKENS_PER_USER);

    if (!tokenCheck.allowed) {
        const errorResponse = new ErrorResponseDTO(
            `Token limit exceeded. Current usage: ${tokenCheck.currentUsage}/${tokenCheck.limit} tokens per hour.`,
            undefined
        );
        return errorResponse;
    }

    const text = order.text;
    let currentText = text;
    const llm = createLLMProvider(); //TODO: make it dynamic?

    while (attempt <= max_Retries) {
        try {
            const result = await extractOrderFromText(order, llm, userId, lastExtraction?.extractedData);

            const savedExtraction = await saveExtraction({
                userId: userId,
                inputText: currentText,
                extractedData: result.order,
                version: version,
                attempts: attempt,
                status: "success",
                provider: process.env.LLM_PROVIDER ?? "unknown",
                model: result.model,
                sessionId: order.sessionId,
                uncertainty: result.uncertainty ?? null,
            });

            const successResponse = new SuccessResponseDTO(
                result.order,
                order.sessionId,
                result.model,
                savedExtraction.createdAt.toISOString(),
                version,
                savedExtraction?.id,
                result.uncertainty
            );

            // Save usage cost with session and extraction IDs
            await createUsageCost({
                userId: userId,
                sessionId: order.sessionId,
                extractionId: savedExtraction.id,
                model: result.model,
                tokensIn: result.tokensIn,
                tokensOut: result.tokensOut,
            });

            return successResponse;
        } catch (error) {

            if (!(error instanceof ExtractionError)) {
                throw error;
            }
            if (attempt === max_Retries || error.reason === "LLM_FAILURE") {
                const errorResponse = new ErrorResponseDTO(
                    error instanceof Error ? error.message : "Invalid input",
                    error instanceof Error ? error.stack : undefined
                );
                return errorResponse;
            }
            attempt++;
            currentText = buildRetryInput(text, error); //TODO: could add previous attempts info 
        }
    }
}


const buildRetryInput = (
    originalText: string,
    error: ExtractionError | null
): string => {
    if (!error) return originalText;

    return `
The previous attempt failed for this reason:
"${error.message}"

Please extract the order again and FIX the issue.
Return ONLY valid JSON that strictly matches the schema.

Original input:
${originalText}
`;
};


export const getSessionResults = async (sessionId: string, userId: string) => {
    try {
        const session = await getSessionWithExtractions(sessionId);
        // Verify user owns this session
        if (!session) {
            return null;
        }
        console.log("Session userId:", session.userId, "Requesting userId:", userId); //!debug
        if (session.userId !== userId) {
            throw new Error("Unauthorized");
        }
        return session;

    } catch (error) {
        throw error;
    }
}
