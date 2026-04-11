import { Injectable } from '@nestjs/common';
import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

interface DataResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: null;
  error: any;
  path: string;
  timestamp: string;
}
@Injectable()
export class AllSuccessResponseFilter implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: DataResponse) => {
        const response = context.switchToHttp().getResponse<Response>();

        response.status(data.statusCode).json(data);
        return;
      }),
    );
  }
}
