import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyAuthGuard } from '@/shared/auth/platform/guards/company-auth.guard';
import { CurrentCompany } from '@/shared/decorators/current-auth.decorator';
import { OnboardingValidation } from './validation/onboarding.validation';
import { Company } from '@/prisma/postgres';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';

@Controller()
@UseGuards(CompanyAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('onboarding')
  async companyLogin(
    @CurrentCompany() company: Company,
    @Body() onboardingValidation: OnboardingValidation,
  ) {
    try {
      const onboarding = await this.companyService.onboarding(
        company.id,
        onboardingValidation,
      );
      return ResponseUtil.success(
        onboarding,
        'Company onboarding successful',
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
  async getProfile(@CurrentCompany() company: Company) {
    const companyProfile = await this.companyService.getCompanyProfile(
      company.id,
    );
    return ResponseUtil.success(
      companyProfile,
      'Company profile retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateCompanyProfile(
    @CurrentCompany() company: Company,
    @Body() updateData: OnboardingValidation,
  ) {
    const updatedCompany = await this.companyService.updateCompanyProfile(
      company.id,
      updateData,
    );
    return ResponseUtil.success(
      updatedCompany,
      'Company profile updated successfully',
      HttpStatus.OK,
    );
  }
}
