import apiClient from "@/src/lib/api";
import type { ApiResponse, ApiErrorResponse } from "@/src/shared/types/api.types";

const api = apiClient.api;

const extractErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
        const responseData = (error as any).response?.data;
        if (responseData?.error && typeof responseData.error === 'string') {
            return responseData.error;
        }
    }
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