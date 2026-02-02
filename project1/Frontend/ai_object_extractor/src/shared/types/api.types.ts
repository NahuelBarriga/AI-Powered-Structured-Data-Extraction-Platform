export interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  data?: any;
}
