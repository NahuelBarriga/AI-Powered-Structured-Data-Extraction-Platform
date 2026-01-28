
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import { ErrorResponseDTO, OrderCreateDTO, SuccessResponseDTO } from "../../shared/DTO/resDTO";
import { ExtractionError } from "../../shared/Errors/extractionError";
import { extractOrderFromText } from "../ai/ai.service";
import { saveExtraction } from "../repositories/extraction.repository";
import { createSession, getLastExtractionFromSession } from "../repositories/session.repository";

const max_Retries = process.env.VITE_MAX_RETRIES
    ? parseInt(process.env.VITE_MAX_RETRIES)
    : 3;

export async function inputService(order: ReqOrderDTO, id: string) {
    let attempt = 1;
    let version = 1;
    let lastExtraction = null;

    if (!order.sessionId) { //create session if not provided
        const session = await createSession({ userId: id });
        order.sessionId = session.id;
    } else { //obtain last extraction and increment version 
        lastExtraction = await getLastExtractionFromSession(order.sessionId);
        if (lastExtraction) {
            version = lastExtraction.version + 1;
        }
    }
        
    const text = order.text;
    const userId = id;
    let currentText = text;

    while (attempt <= max_Retries) {
        try {
            const result = await extractOrderFromText(order, lastExtraction?.inputText);
            const orderDTO = new OrderCreateDTO(result);
            const successResponse = new SuccessResponseDTO(orderDTO);

            await saveExtraction({
                userId: userId,
                inputText: currentText,
                extractedData: result,
                version: version, 
                confidence: 1, // Assuming full confidence for now
                attempts: attempt,
                status: "success",
                provider: process.env.LLM_PROVIDER ?? "unknown",
                model: process.env.OPENAI_MODEL ?? "unknown",
                sessionId: order.sessionId,
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