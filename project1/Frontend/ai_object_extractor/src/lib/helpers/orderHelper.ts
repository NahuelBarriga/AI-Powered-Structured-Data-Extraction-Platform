import apiClient from "@/src/lib/api";
import type { ApiResponse, ApiErrorResponse } from "@/src/shared/types/api.types";

const api = apiClient.api;

/**
 * Extracts error message from various error types.
 * Handles API error responses, Error objects, and fallback cases.
 * 
 * @param error - Unknown error from catch block
 * @returns Extracted error message string
 */
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

/**
 * Submits order data for classic (non-streaming) extraction.
 * Makes a POST request to /api/order endpoint with authentication.
 * 
 * @param orderData - Raw text containing order information
 * @param sessionId - Optional session ID for retry mode
 * @param mode - Optional extraction mode ("new" or "retry")
 * @returns Promise resolving to extraction result with order data and confidence
 * @throws Error with descriptive message if request fails
 */
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

/**
 * Retrieves previously saved extraction results for a session.
 * Used to fetch extraction data by session ID from database.
 * 
 * @param sessionId - Session ID to retrieve results for
 * @returns Promise resolving to session extraction data
 * @throws Error with descriptive message if request fails
 */
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