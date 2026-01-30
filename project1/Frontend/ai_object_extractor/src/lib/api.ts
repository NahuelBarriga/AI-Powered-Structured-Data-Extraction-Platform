import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

// axios instance 
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const baseApi = axios.create({ //for auth porposes, without interceptors
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token from NextAuth session
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get session from NextAuth
    const session = await getSession();

    if (session?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Unauthorized - handled by NextAuth
          console.error("Unauthorized:", data?.error || "Authentication required");
          break;
        case 403:
          console.error("Forbidden:", data?.error || "Access denied");
          break;
        case 429:
          // Rate limit exceeded
          console.error("Rate limit exceeded:", data?.error);
          break;
        case 422:
          // Validation error
          console.error("Validation error:", data?.error);
          break;
        case 500:
          console.error("Server error:", data?.error || "Internal server error");
          break;
        default:
          console.error("API Error:", data?.error || error.message);
      }

      // Return error data for specific handling
      return Promise.reject({
        status,
        message: data?.error || error.message,
        data: data,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error: No response from server");
      return Promise.reject({
        status: 0,
        message: "Network error: Could not reach the server",
      });
    } else {
      // Something else happened
      console.error("Request error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message,
      });
    }
  }
);


// Export the configured axios instance for custom calls
export default {
  api,
  baseApi
};
