import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';

export function imageFilter(
  fileMimetype: string,
  callback: (error: Error | null, acceptFile: boolean) => void,
  allowed: string[],
) {
  {
    if (!allowed.map((el) => 'image/' + el).includes(fileMimetype)) {
      return callback(
        new CustomHttpException(
          'Invalid file type',
          null,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
    callback(null, true);
  }
}
