//testing porposes
import type { Request, Response } from "express";
import { extractOrderFromText } from "./ai.service";

export async function extractOrderController(
  req: Request,
  res: Response
) {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "Missing or invalid 'text' field",
    });
  }

  try {
    const order = await extractOrderFromText(text);
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      raw: error.raw ?? null,
    });
  }
}
