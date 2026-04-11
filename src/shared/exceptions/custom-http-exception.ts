import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseUtil } from '../utils/response.util';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    errors: any = null,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(ResponseUtil.error(errors, message, statusCode), statusCode);
  }
}
