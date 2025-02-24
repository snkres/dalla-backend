import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyAuthGuard } from '@/shared/auth/platform/guards/company-auth.guard';
import { CurrentCompany } from '@/shared/decorators/current-auth.decorator';
import { OnboardingValidation } from './validation/onboarding.validation';
import { Company } from '@/prisma/postgres';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { createProjectValidation } from '@/projects/validation/create-project.validation';
import { ChangeProjectRequestValidation } from './validation/change-project-request.validation';

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

  @Get('projects')
  async getProjects(
    @CurrentCompany() company: Company,
    @Query() query: PaginationDto,
  ) {
    const projects = await this.companyService.companyProjects(
      company.id,
      query,
    );
    return ResponseUtil.success(projects, 'Company projects retrieved');
  }

  @Post('projects')
  async createProject(
    @CurrentCompany() company: Company,
    @Body() projectData: createProjectValidation,
  ) {
    const project = await this.companyService.createProject({
      companyId: company.id,
      ...projectData,
    });
    return ResponseUtil.success(
      project,
      'Project created successfully',
      HttpStatus.CREATED,
    );
  }

  @Put('projects/:projectId/requests/:requestId')
  async updateProjectRequest(
    @CurrentCompany() company: Company,
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
    @Body() request: ChangeProjectRequestValidation,
  ) {
    const updatedRequest = await this.companyService.changeProjectRequest(
      requestId,
      request.status,
    );
    return ResponseUtil.success(
      updatedRequest,
      'Project request updated successfully',
    );
  }
}
