import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { IdValidationPipe } from '@/shared/pipes/id-validation.pipe';

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
    try {
      const companyProfile = await this.companyService.getCompanyProfile(
        company.id,
      );
      return ResponseUtil.success(
        companyProfile,
        'Company profile retrieved successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateCompanyProfile(
    @CurrentCompany() company: Company,
    @Body() updateData: OnboardingValidation,
  ) {
    try {
      const updatedCompany = await this.companyService.updateCompanyProfile(
        company.id,
        updateData,
      );
      return ResponseUtil.success(
        updatedCompany,
        'Company profile updated successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Projects

  @Post('projects')
  async createProject(
    @CurrentCompany() company: Company,
    @Body() projectData: createProjectValidation,
  ) {
    try {
      const project = await this.companyService.createProject(
        company.id,
        projectData,
      );
      return ResponseUtil.success(
        project,
        'Project created successfully',
        HttpStatus.CREATED,
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

  @Get('projects')
  async getProjects(
    @CurrentCompany() company: Company,
    @Query() query: PaginationDto,
  ) {
    try {
      const projects = await this.companyService.companyProjects(
        company.id,
        query,
      );
      return ResponseUtil.success(projects, 'Company projects retrieved');
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

  @Get('projects/:projectId')
  async getProject(
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
  ) {
    try {
      const project = await this.companyService.companyProject(projectId);
      return ResponseUtil.success(project, 'Project retrieved successfully');
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

  @Put('projects/:projectId')
  async updateProject(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Body() projectData: createProjectValidation,
  ) {
    try {
      const updatedProject = await this.companyService.modifyProject(
        company.id,
        projectId,
        projectData,
      );
      return ResponseUtil.success(
        updatedProject,
        'Project updated successfully',
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

  @Delete('projects/:projectId')
  async deleteProject(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
  ) {
    try {
      const updatedProject = await this.companyService.deleteProject(
        company.id,
        projectId,
      );
      return ResponseUtil.success(
        updatedProject,
        'Project deleted successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Project requests

  @Get('projects/:projectId/requests')
  async getProjectRequests(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Query() query: PaginationDto,
  ) {
    try {
      const requests = await this.companyService.projectRequests(
        company.id,
        projectId,
        query,
      );
      return ResponseUtil.success(requests, 'Project requests retrieved');
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

  @Get('projects/:projectId/requests/:requestId')
  async getProjectRequest(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('requestId', new IdValidationPipe('projectRequest'))
    requestId: string,
  ) {
    try {
      const request = await this.companyService.projectRequest(
        company.id,
        projectId,
        requestId,
      );
      return ResponseUtil.success(request, 'Project request retrieved');
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

  @Patch('projects/:projectId/requests/:requestId')
  async modifyRequestStatus(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('requestId', new IdValidationPipe('projectRequest'))
    requestId: string,
    @Body() request: ChangeProjectRequestValidation,
  ) {
    try {
      const updatedRequest = await this.companyService.modifyRequestStatus(
        company.id,
        projectId,
        requestId,
        request.status,
      );
      return ResponseUtil.success(
        updatedRequest,
        'Project request updated successfully',
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
