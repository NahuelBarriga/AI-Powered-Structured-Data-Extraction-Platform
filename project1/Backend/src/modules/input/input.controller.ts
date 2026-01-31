import type { Request, Response } from "express";
import {
    ErrorResponseDTO,
} from "../../shared/DTO/resDTO";
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import { getSessionResults, inputService } from "./input.service";


export async function inputController(req: Request, res: Response) {
    console.log("Input Controller called"); //!debug
    const request = new ReqOrderDTO(
        req.body?.sessionId,
        req.body?.text,
        req.body?.mode
    );

    if (!request.text || typeof request.text !== "string") {
        const errorResponse = new ErrorResponseDTO("Missing input text");
        return res.status(400).json(errorResponse);
    }
    try {
        const result = await inputService(request, req.user?.id || '1'); //TODO: handle unauthenticated properly
        return res.status(200).json(result);
    } catch (error) {
        res.status(422).json(new ErrorResponseDTO(
            error instanceof Error ? error.message : "Invalid input", //TODO: check if handled correctly
            error instanceof Error ? error.stack : undefined
        ));
    }
}

export async function getSessionResultsController(req: Request, res: Response) {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== "string") {
        const errorResponse = new ErrorResponseDTO("Missing or invalid sessionId");
        return res.status(400).json(errorResponse);
    }

    try {
        const session = await getSessionResults(sessionId, req.user?.id || '1'); //!fix 

        if (!session) {
            const errorResponse = new ErrorResponseDTO("Session not found");
            return res.status(404).json(errorResponse);
        }

        return res.status(200).json({
            session: {
                id: session.id,
                createdAt: session.createdAt,
            },
            extractions: session.extractions,
            totalExtractions: session.extractions.length,
        });
    } catch (error) {
        res.status(500).json(new ErrorResponseDTO(
            error instanceof Error ? error.message : "Failed to fetch session",
            error instanceof Error ? error.stack : undefined
        ));
    }
}







