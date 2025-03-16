import {
  Body,
  Controller,
  Delete,
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
import { CurrentCompany } from '@/shared/decorators/current-auth.decorator';
import { OnboardingValidation } from './validation/onboarding.validation';
import { Company } from '@/prisma/postgres';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { createProjectValidation } from '@/projects/validation/create-project.validation';
import { ChangeProjectProposalValidation } from './validation/change-project-proposal.validation';
import { IdValidationPipe } from '@/shared/pipes/id-validation.pipe';
import { AuthGuard } from '@/shared/auth/platform/guards/auth.guard';
import { UserTypes } from '@/shared/enums/user-types.enum';
import { ProfessionalsService } from '@/professionals/professional.service';

@Controller()
@UseGuards(AuthGuard(UserTypes.Company))
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly professionalsService: ProfessionalsService,
  ) {}

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
      const companyProfile = await this.companyService.getProfile(company.id);
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

  @Get('professional/:professionalUsername')
  async getProfessional(
    @Param('professionalUsername') professionalUsername: string,
  ) {
    try {
      const professional =
        await this.professionalsService.getProfileByUsername(
          professionalUsername,
        );
      return ResponseUtil.success(
        professional,
        'Professional retrieved successfully',
      );
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
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

  // Project proposals

  @Get('projects/:projectId/proposals')
  async getProjectProposals(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Query() query: PaginationDto,
  ) {
    try {
      const proposals = await this.companyService.projectProposals(
        company.id,
        projectId,
        query,
      );
      return ResponseUtil.success(proposals, 'Project proposals retrieved');
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

  @Get('projects/:projectId/proposals/:proposalId')
  async getProjectProposal(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('proposalId', new IdValidationPipe('proposal'))
    proposalId: string,
  ) {
    try {
      const proposal = await this.companyService.projectProposal(
        company.id,
        projectId,
        proposalId,
      );
      return ResponseUtil.success(proposal, 'Project proposal retrieved');
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

  @Patch('projects/:projectId/proposals/:proposalId')
  async modifyProposalStatus(
    @CurrentCompany() company: Company,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('proposalId', new IdValidationPipe('proposal'))
    proposalId: string,
    @Body() proposal: ChangeProjectProposalValidation,
  ) {
    try {
      const updatedProposal = await this.companyService.modifyProposalStatus(
        company.id,
        projectId,
        proposalId,
        proposal.status,
      );
      return ResponseUtil.success(
        updatedProposal,
        'Proposal updated successfully',
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
