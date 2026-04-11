export interface SuccessResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | unknown;
  error: null;
  path: string;
  timestamp: string;
}

export interface ErrorResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: null;
  error: any;
  path: string;
  timestamp: string;
}

export class ResponseUtil {
  static success<T>(
    data: T | unknown,
    message: string = 'Request was successful',
    statusCode: number = 200,
    path: string = '',
  ): SuccessResponse<T> {
    return {
      statusCode,
      success: true,
      message,
      data,
      error: null,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    error: any,
    message: string = 'An error occurred',
    statusCode: number = 500,
    path: string = '',
  ): ErrorResponse {
    return {
      statusCode,
      success: false,
      message,
      data: null,
      error,
      path,
      timestamp: new Date().toISOString(),
    };
  }
}
