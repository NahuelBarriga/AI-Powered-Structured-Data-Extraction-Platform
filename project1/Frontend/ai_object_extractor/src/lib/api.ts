import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// axios instance 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
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

// API Methods

export async function extractText(
  text: string,
  sessionId?: string,
  mode: "create" | "refine" = "create"
) {
  const response = await api.post("/api/input", {
    text,
    sessionId,
    mode,
  });

  return response.data;
}

export async function login(email: string, password: string) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  // Store token on successful login
  if (response.data.token) {
    localStorage.setItem("authToken", response.data.token);
  }

  return response.data;
}

export async function register(
  email: string,
  password: string,
  name: string
) {
  const response = await api.post("/api/auth/register", {
    email,
    password,
    name,
  });

  // Store token on successful registration
  if (response.data.token) {
    localStorage.setItem("authToken", response.data.token);
  }

  return response.data;
}

export async function logout() {
  localStorage.removeItem("authToken");
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

// Export the configured axios instance for custom calls
export default api;
