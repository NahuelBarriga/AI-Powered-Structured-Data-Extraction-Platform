export const LLM_PROVIDER = process.env.LLM_PROVIDER || undefined
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || undefined
export const OPENAI_MODEL = process.env.OPENAI_MODEL || undefined
export const OPENAI_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || "0") //could be configured dynamically 
export const OPENAI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || "0.1")