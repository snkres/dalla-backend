import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { User } from '@/prisma/postgres';
import { ProfessionalUpdateValidation } from './dto/professional-update.validation';
import { CompanyAuthGuard } from '@/shared/auth/platform/guards/company-auth.guard';

@Controller()
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post('parse-resume')
  @UseGuards(ProfessionalAuthGuard)
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
      const parsedResume = await this.professionalsService.parseResume(file);
      return ResponseUtil.success(parsedResume, 'Resume parsed successfully');
    } catch (err) {
      return new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('onboarding')
  @UseGuards(ProfessionalAuthGuard)
  async professionalOnboarding(
    @CurrentUser() professional,
    @Body() data: ProfessionalOnboardingDto,
  ) {
    try {
      const onboarding = await this.professionalsService.onboarding(
        professional.id,
        data,
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

  @Get('profile')
  @UseGuards(ProfessionalAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.professionalsService.getCurrentUser(user.id);
    return ResponseUtil.success(profile, 'current user profile retrieved');
  }

  @Patch('profile')
  @UseGuards(ProfessionalAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() data: ProfessionalUpdateValidation,
  ) {
    const updatedProfile = await this.professionalsService.updateProfile(
      user.id,
      data,
    );
    return ResponseUtil.success(updatedProfile, 'Profile updated successfully');
  }

  @Get(':professionalId')
  @UseGuards(CompanyAuthGuard)
  async getProfessionalProfile(
    @Param('professionalId') professionalId: string,
  ) {
    const profile = await this.professionalsService.getProfile(professionalId);
    return ResponseUtil.success(profile, 'Professional profile retrieved');
  }
}
