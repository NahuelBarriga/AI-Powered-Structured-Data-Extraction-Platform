import type { Request, Response } from "express";
import {
    ErrorResponseDTO,
} from "../../shared/DTO/resDTO";
import { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import { inputService } from "./input.service";

export async function inputController(req: Request, res: Response) {
    const request = new ReqOrderDTO(
        req.body.sessionId,
        req.body.text,
        req.body.mode
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







