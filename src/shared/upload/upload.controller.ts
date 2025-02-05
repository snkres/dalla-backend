import {
  Controller,
  Post,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ResponseUtil } from '../utils/response.util';
import { CustomHttpException } from '../exceptions/custom-http-exception';
import { ProfessionalAuthGuard } from '../auth/platform/guards/professionals-auth.guard';
import { CompanyAuthGuard } from '../auth/platform/guards/company-auth.guard';

@Controller('upload')
@UseGuards(ProfessionalAuthGuard, CompanyAuthGuard)
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
