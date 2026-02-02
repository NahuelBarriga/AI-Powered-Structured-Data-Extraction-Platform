import type { Request, Response } from "express";
import {
    ErrorResponseDTO,
} from "../../shared/DTO/resDTO";
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import { getSessionResults, inputService } from "./input.service";


export async function inputController(req: Request, res: Response) {
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
        const result = await inputService(request, req.user?.id || '1'); //TODO: handle unauthenticated properly
        
        // Check if result is an error response
        if (result && !result.success) {
            return res.status(422).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error 
            ? error.message 
            : "Unable to process the order. Please try again.";
        
        res.status(422).json(new ErrorResponseDTO(
            errorMessage,
            process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        ));
    }
}

export async function getSessionResultsController(req: Request, res: Response) {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== "string") {
        const errorResponse = new ErrorResponseDTO("Invalid session ID provided");
        return res.status(400).json(errorResponse);
    }

    try {
        const session = await getSessionResults(sessionId, req.user?.id || '1'); //!fix 

        if (!session) {
            const errorResponse = new ErrorResponseDTO("Session not found. It may have expired or been deleted.");
            return res.status(404).json(errorResponse);
        }

        return res.status(200).json({
            success: true,
            data: {
                session: {
                    id: session.id,
                    createdAt: session.createdAt,
                },
                extractions: session.extractions,
                totalExtractions: session.extractions.length,
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error 
            ? error.message 
            : "Unable to load the session. Please try again.";
            
        res.status(500).json(new ErrorResponseDTO(
            errorMessage,
            process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        ));
    }
}







