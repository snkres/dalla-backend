import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfessionalsService } from './professional.service';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { ResponseUtil } from '@/shared/utils/response.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessionalAuthGuard } from '@/shared/auth/platform/guards/professionals-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-auth.decorator';
import { imageFilter } from '@/shared/utils/image-file';

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

  @UseGuards(ProfessionalAuthGuard)
  @Post('onboarding')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
        files: 1,
      },
      fileFilter: (_req, file, callback) =>
        imageFilter(file.mimetype, callback, ['jpg', 'jpeg', 'svg', 'png']),
    }),
  )
  async professionalOnboarding(
    @CurrentUser() professional,
    @Body() form: { body: string },
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    try {
      const onboardingData = JSON.parse(form.body);
      const onboarding = await this.professionalsService.onboarding(
        professional.id,
        {
          ...onboardingData,
          avatar,
        },
      );
      return ResponseUtil.success(
        onboarding,
        'Professional onboarding successful',
        HttpStatus.CREATED,
      );
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
