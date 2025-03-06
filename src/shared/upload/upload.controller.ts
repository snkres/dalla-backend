import {
  Controller,
  Post,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ResponseUtil } from '../utils/response.util';
import { CustomHttpException } from '../exceptions/custom-http-exception';
import { UnifiedGuard } from '../auth/platform/guards/unified-guard';

@Controller('upload')
@UseGuards(UnifiedGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpg|png|jpeg',
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
      console.log(err);
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
