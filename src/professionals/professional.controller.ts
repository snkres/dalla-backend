import {
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfessionalsService } from './professional.service';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { ResponseUtil } from '@/shared/utils/response.util';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post('parse-resume')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
        files: 1,
      },
    }),
  )
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    try {
      const parsedResume = await this.professionalsService.parseResume(
        file.buffer,
      );
      return ResponseUtil.success(parsedResume, 'Resume parsed successfully');
    } catch (err) {
      return new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
