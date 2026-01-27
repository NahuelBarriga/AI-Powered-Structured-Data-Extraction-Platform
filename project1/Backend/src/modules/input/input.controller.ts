import type { Request, Response } from "express";
import { extractOrderFromText } from "../ai/ai.service";
import { saveExtraction } from "../repositories/extraction.repository";
import {
    OrderCreateDTO,
    SuccessResponseDTO,
    ErrorResponseDTO,
} from "../../shared/DTO/resDTO";
import { ExtractionError } from "../../shared/Errors/extractionError";
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";

const max_Retries = process.env.VITE_MAX_RETRIES
    ? parseInt(process.env.VITE_MAX_RETRIES)
    : 3;

export async function inputController(req: Request, res: Response) {
    let attempt = 1;
    const request = new ReqOrderDTO(
        req.body.sessionId,
        req.body.text,
        req.body.mode
    );
    const text = request.text;
    const userId = req.user?.id || '1'; //todo: handle unauthenticated properly
    let currentText = text;
    if (!currentText || typeof currentText !== "string") {
        const errorResponse = new ErrorResponseDTO("Missing input text");
        return res.status(400).json(errorResponse);
    }
    while (attempt <= max_Retries) {
        try {
            const result = await extractOrderFromText(currentText);
            const orderDTO = new OrderCreateDTO(result);
            const successResponse = new SuccessResponseDTO(orderDTO);

            await saveExtraction({ //todo: maybe move to service layer
                userId: userId,
                inputText: currentText,
                extractedData: result,
                confidence: 1, // Assuming full confidence for now
                attempts: attempt,
                status: "success",
                provider: process.env.LLM_PROVIDER ?? "unknown",
                model: process.env.OPENAI_MODEL ?? "unknown",
            });

            return res.status(200).json(successResponse);
        } catch (error) {

            if (!(error instanceof ExtractionError)) {
                throw error;
            }
            if (attempt === max_Retries || error.reason === "LLM_FAILURE") {
                const errorResponse = new ErrorResponseDTO(
                    error instanceof Error ? error.message : "Invalid input",
                    error instanceof Error ? error.stack : undefined
                );
                return res.status(422).json(errorResponse);
            }
            attempt++;
            currentText = buildRetryInput(text, error); //todo: could add previous attempts info 
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



