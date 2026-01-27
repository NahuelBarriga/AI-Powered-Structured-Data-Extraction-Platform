export class ReqOrderDTO {
    sessionId: string | undefined;
    text: string;
    mode: 'new' | 'retry' | 'refine';

    constructor(sessionId: string | undefined, text: string, mode: string) {
        this.sessionId = sessionId || undefined;
        this.text = text;
        this.mode = (mode as 'new' | 'retry' | 'refine') || 'new';
    }
}


