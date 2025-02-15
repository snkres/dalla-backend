import {
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResponseUtil } from '@/shared/utils/response.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';

@Controller()
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('parse')
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
      const parsedResume = await this.resumesService.parseResume(file.buffer);
      return ResponseUtil.success(parsedResume, 'Resume parsed successfully');
    } catch (err) {
      return new CustomHttpException(
        err.message,
        err.errors,
        err.status ||  HttpStatus.BAD_REQUEST,
      );
    }
  }
}
