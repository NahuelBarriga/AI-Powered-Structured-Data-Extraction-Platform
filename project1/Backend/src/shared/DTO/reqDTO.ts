/**
 * Data Transfer Object for incoming order extraction requests.
 * Contains user input text, optional session ID for retry mode, and extraction mode.
 */
export class ReqOrderDTO {
    sessionId: string | undefined;
    text: string;
    mode: 'new' | 'retry' | 'refine';

    /**
     * Creates a new request DTO.
     * 
     * @param sessionId - Optional session ID for continuing previous extraction session
     * @param text - Raw order text to extract data from
     * @param mode - Extraction mode: "new" (fresh), "retry" (improve previous), "refine" (user-guided fix)
     */
    constructor(sessionId: string | undefined, text: string, mode: string) {
        this.sessionId = sessionId || undefined;
        this.text = text;
        this.mode = (mode as 'new' | 'retry' | 'refine') || 'new';
    }
}


