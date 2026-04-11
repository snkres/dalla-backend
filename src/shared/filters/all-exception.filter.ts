/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Catch,
  HttpException,
  ExceptionFilter,
  Logger,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Request, Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

// Define custom exception response structure
export interface CustomExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
}

@Catch(
  HttpException,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  MongoError,
)
export class AllExceptionFilter<
  T extends
    | HttpException
    | PrismaClientKnownRequestError
    | PrismaClientValidationError
    | MongoError,
> implements ExceptionFilter
{
  private readonly logger = new Logger();

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, originalUrl, query, headers, params, body } = request;
    const requestId = headers?.requestId;

    // Default to internal server error if not specifically set
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = exception.name;

    try {
      if (exception instanceof HttpException) {
        // Handle HttpException
        const {
          statusCode: httpStatusCode,
          message: httpMessage,
          error: httpError,
        }: CustomExceptionResponse = exception.getResponse() as CustomExceptionResponse;
        statusCode = httpStatusCode;
        message = httpMessage || message;
        error = httpError || error;
      } else if (exception instanceof PrismaClientKnownRequestError) {
        // Handle Prisma specific error (e.g., unique constraint violations)
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Prisma Error: ${exception.message}`;
        error = 'PrismaClientKnownRequestError';
      } else if (exception instanceof PrismaClientValidationError) {
        // Handle Prisma validation errors
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Prisma Validation Error: ${exception.message}`;
        error = 'PrismaClientValidationError';
      } else if (exception instanceof MongoError) {
        // Handle MongoDB errors (e.g., duplicate key error)
        statusCode = HttpStatus.BAD_REQUEST;
        message = exception.message;
        error = 'MongoDB Error';
      } else {
        // Generic exception handler
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        //@ts-expect-error
        message = exception?.message || message;
        //@ts-expect-error
        error = exception?.name || error;
      }

      // Prepare the stack trace for logging (only in development)
      const stack = exception['stack'] || message;

      // Log request details for debugging
      this.logger.debug(
        `${method}: ${originalUrl}; Params: ${JSON.stringify(params)}; Query: ${JSON.stringify(query)}; Body: ${JSON.stringify(body)}`,
        `[DEBUG] [${method}:${originalUrl}] {reqID: ${requestId}}`,
      );

      // Log the error itself
      this.logger.error(
        JSON.stringify(exception),
        `ExceptionFilter [${originalUrl}] {reqID: ${requestId}}`,
      );

      // Log the stack trace (useful for debugging)
      if (process.env.NODE_ENV === 'development') {
        this.logger.error(
          JSON.stringify({ stack }),
          `ExceptionFilter-stack [${originalUrl}] {reqID: ${requestId}}`,
        );
      }

      // Send error response back to client
      response.status(statusCode).json({
        statusCode,
        success: false,
        message: message || 'Error occurred',
        data: null,
        error,
        path: originalUrl,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack }), // Send stack trace in dev mode
      });
    } catch (error) {
      // Log any error occurring within the catch block itself
      this.logger.error(
        JSON.stringify(error),
        `ExceptionFilter processing error: {reqID: ${requestId}}`,
      );

      // Send fallback response if an error occurs within the filter
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
        path: originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
