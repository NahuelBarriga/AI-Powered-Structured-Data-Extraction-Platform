import apiClient from "@/src/lib/api";

const api = apiClient.api;

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

interface ApiErrorResponse {
  status: number;
  message: string;
  data?: any;
}

const extractErrorMessage = (error: unknown): string => {
  // If it's our API error format
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiErrorResponse).message;
  }
  // If it's a regular Error
  if (error instanceof Error) {
    return error.message;
  }
  // Default fallback
  return "An unexpected error occurred. Please try again.";
};

export const submitOrder = async (orderData: string, sessionId?: string, mode?: string): Promise<any> => {
    try {
        const response = await api.post("/api/order", { 
            text: orderData,
            mode: mode ? mode : sessionId ? 'retry' : 'new',
            sessionId: sessionId,
        });
        
        const data: ApiResponse = response.data;
        
        if (!data.success && data.error) {
            throw new Error(data.error);
        }
        
        return data.data || data;
    } catch (error) {
        const message = extractErrorMessage(error);
        throw new Error(message);
    }
}

export const getSessionResults = async (sessionId: string): Promise<any> => {
    try {
        const response = await api.get(`/api/order/session/${sessionId}`);
        const data: ApiResponse = response.data;
        
        if (!data.success && data.error) {
            throw new Error(data.error);
        }
        
        return data.data || data;
    } catch (error) {
        const message = extractErrorMessage(error);
        throw new Error(message);
    }
}