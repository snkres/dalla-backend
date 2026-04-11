import {
  Controller,
  Post,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ResponseUtil } from '../utils/response.util';
import { CustomHttpException } from '../exceptions/custom-http-exception';
import { AuthGuard } from '../auth/platform/guards/auth.guard';

@Controller('upload')
@UseGuards(AuthGuard())
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpg|png|jpeg|pdf',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const fileUrl = await this.uploadService.uploadFile(file);
      return ResponseUtil.success(
        { fileUrl },
        'File uploaded successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      this.logger.error(
        `Upload request failed for file=${file?.originalname ?? '<unknown>'}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new CustomHttpException(
        err?.message,
        {
          cause: err,
          description: err,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
