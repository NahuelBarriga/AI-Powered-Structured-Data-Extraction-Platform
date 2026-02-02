import type { Request, Response } from "express";
import {
    ErrorResponseDTO,
    SuccessResponseDTO,
} from "../../shared/DTO/resDTO";
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import { streamExtractOrderFromText } from "../ai/ai.streaming";
import { saveExtraction } from "./input.repository";
import { createSession, getLastExtractionFromSession, updateSessionLastExtraction } from "../control/session.repository";
import { checkUserTokenLimit, createUsageCost } from "../control/usageCost.repository";
import { createLLMProvider } from "../ai/providers/llmFactory";

const MAX_TOKENS_PER_USER = process.env.MAX_TOKENS_PER_USER
    ? parseInt(process.env.MAX_TOKENS_PER_USER)
    : 10000;

/**
 * Express controller for handling Server-Sent Events streaming extraction requests.
 * Validates input, applies rate limiting/token limits, streams tokens from LLM,
 * validates JSON schema, calculates confidence, and saves extraction to database.
 * 
 * @param req - Express request with order text in body
 * @param res - Express response to stream SSE events to
 * 
 * The controller:
 * 1. Validates input text (presence, length > 5 chars)
 * 2. Creates or retrieves session for tracking extraction
 * 3. Checks user token limit
 * 4. Sets up SSE headers for streaming response
 * 5. Streams tokens from LLM provider
 * 6. Sends "token", "preview", and "complete" events to client
 * 7. Saves validated extraction to database
 * 8. Sends "saved" event with extraction ID
 * 9. Handles errors and sends error events
 */
export async function streamingInputController(req: Request, res: Response) {
    console.log("Streaming Input Controller called");
    const request = new ReqOrderDTO(
        req.body?.sessionId,
        req.body?.text,
        req.body?.mode
    );

    if (!request.text || typeof request.text !== "string") {
        const errorResponse = new ErrorResponseDTO("Please provide order text to extract");
        return res.status(400).json(errorResponse);
    }

    if (request.text.trim().length < 5) {
        const errorResponse = new ErrorResponseDTO("Please provide more detailed order information");
        return res.status(400).json(errorResponse);
    }

    try {
        let sessionId = request.sessionId;
        let lastExtraction = null;
        let version = 1;
        let attempt = 1;

        if (!sessionId) {
            const session = await createSession({ userId: req.user?.id || '1' });
            sessionId = session.id;
        } else {
            lastExtraction = await getLastExtractionFromSession(sessionId);
            if (lastExtraction) {
                version = lastExtraction.version + 1;
            }
        }

        const userId = req.user?.id || '1';
        const estimatedTokens = Math.ceil(request.text.length / 4);

        // Check token limit
        const tokenCheck = await checkUserTokenLimit(userId, estimatedTokens, MAX_TOKENS_PER_USER);
        if (!tokenCheck.allowed) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.write(`data: ${JSON.stringify({ type: "error", error: "Token limit exceeded" })}\n\n`);
            res.end();
            return;
        }

        // Set SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        const llm = createLLMProvider();
        let fullExtractionResult: any = null;
        const modelName = (llm as any).model || process.env.LLM_PROVIDER || "unknown";

        try {
            // Stream tokens
            for await (const event of streamExtractOrderFromText(
                request,
                llm,
                userId,
                lastExtraction?.extractedData,
                attempt
            )) {
                res.write(`data: ${JSON.stringify(event)}\n\n`);

                // Capture final result for saving
                if (event.type === "complete" && event.result) {
                    fullExtractionResult = event.result;
                } else if (event.type === "error") {
                    // Stop streaming on error
                    res.end();
                    return;
                }
            }

            // Save extraction to database after streaming completes successfully
            if (fullExtractionResult) {
                const savedExtraction = await saveExtraction({
                    userId: userId,
                    inputText: request.text,
                    extractedData: fullExtractionResult.order,
                    version: version,
                    attempts: attempt,
                    status: "success",
                    provider: process.env.LLM_PROVIDER ?? "unknown",
                    tokensIn: fullExtractionResult.tokensIn,
                    tokensOut: fullExtractionResult.tokensOut,
                    model: modelName,
                    sessionId: sessionId,
                    uncertainty: fullExtractionResult.uncertainty ?? null,
                });

                // Update session's lastExtractionId
                await updateSessionLastExtraction(sessionId, savedExtraction.id);

                // Save usage cost
                await createUsageCost({
                    userId: userId,
                    sessionId: sessionId,
                    extractionId: savedExtraction.id,
                    model: modelName || "unknown",
                    tokensIn: fullExtractionResult.tokensIn,
                    tokensOut: fullExtractionResult.tokensOut,
                });

                // Send final acknowledgment
                res.write(`data: ${JSON.stringify({
                    type: "saved",
                    extractionId: savedExtraction.id,
                    sessionId: sessionId,
                })}\n\n`);
            }

            res.end();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Stream processing failed";
            res.write(`data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`);
            res.end();
        }
    } catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : "Unable to process the streaming order. Please try again.";

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write(`data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`);
        res.end();
    }
}
