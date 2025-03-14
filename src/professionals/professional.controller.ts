import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfessionalsService } from './professional.service';
import { ResponseUtil } from '@/shared/utils/response.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/shared/decorators/current-auth.decorator';
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { User } from '@/prisma/postgres';
import { ProfessionalUpdateValidation } from './dto/professional-update.validation';
import { CreateProposalValidation } from '@/projects/validation/create-proposal.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { IdValidationPipe } from '@/shared/pipes/id-validation.pipe';
import { FetchProjectsOptionsDto } from '@/projects/dto/fetch-projects-options.dto';
import { ProfessionalProjectDto } from './dto/professional-project.dto';
import { AuthGuard } from '@/shared/auth/platform/guards/auth.guard';
import { UserTypes } from '@/shared/enums/user-types.enum';

@Controller()
@UseGuards(AuthGuard(UserTypes.User))
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
    const parsedResume = await this.professionalsService.parseResume(file);
    return ResponseUtil.success(parsedResume, 'Resume parsed successfully');
  }

  @Post('onboarding')
  async professionalOnboarding(
    @CurrentUser() professional: User,
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
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.professionalsService.getCurrentUser(user.id);
    return ResponseUtil.success(profile, 'current user profile retrieved');
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() data: ProfessionalUpdateValidation,
  ) {
    try {
      const updatedProfile = await this.professionalsService.updateProfile(
        user.id,
        data,
      );
      return ResponseUtil.success(
        updatedProfile,
        'Profile updated successfully',
      );
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('profile/:professionalId')
  async getProfessionalProfile(
    @Param('professionalId') professionalId: string,
  ) {
    const profile = await this.professionalsService.getProfile(professionalId);
    return ResponseUtil.success(profile, 'Professional profile retrieved');
  }

  @Post('profile/:professionalId/projects')
  async addProjectToProfile(
    @CurrentUser() professional: User,
    @Param('professionalId') professionalId: string,
    @Body() data: ProfessionalProjectDto,
  ) {
    if (professional.id !== professionalId) {
      throw new ForbiddenException(
        'You can only add projects to your own profile',
      );
    }

    try {
      const project = await this.professionalsService.createProfessionalProject(
        professional.id,
        data,
      );
      return ResponseUtil.success(project, 'Project added to profile');
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('profile/:professionalId/projects/:professionalProjectId')
  async updateProfessionalProject(
    @CurrentUser() professional: User,
    @Param('professionalProjectId', new IdValidationPipe('professionalProject'))
    professionalProjectId: string,
    @Param('professionalId') professionalId: string,
    @Body() data: ProfessionalProjectDto,
  ) {
    if (professional.id !== professionalId) {
      throw new ForbiddenException(
        'You can only add projects to your own profile',
      );
    }

    try {
      const project = await this.professionalsService.updateProfessionalProject(
        professional.id,
        professionalProjectId,
        data,
      );
      return ResponseUtil.success(project, 'Project updated successfully');
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('profile/:professionalId/projects/:professionalProjectId')
  async deleteProfessionalProject(
    @CurrentUser() professional: User,
    @Param('professionalProjectId', new IdValidationPipe('professionalProject'))
    professionalProjectId: string,
    @Param('professionalId') professionalId: string,
  ) {
    if (professional.id !== professionalId) {
      throw new ForbiddenException(
        'You can only add projects to your own profile',
      );
    }

    try {
      const project = await this.professionalsService.deleteProfessionalProject(
        professional.id,
        professionalProjectId,
      );
      return ResponseUtil.success(project, 'Project deleted successfully');
    } catch (err) {
      throw new CustomHttpException(
        err.message,
        err.errors,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('projects')
  async getProjects(
    @CurrentUser() professional: User,
    @Query() query: FetchProjectsOptionsDto,
  ) {
    const { limit, page, assigned } = query;
    try {
      const projects = await this.professionalsService.getProjects(
        professional.id,
        { page, limit },
        assigned ?? false,
      );

      return ResponseUtil.success(projects, 'Projects retrieved successfully');
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
  async getProjectById(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
  ) {
    try {
      const project = await this.professionalsService.getProjectById(
        user.id,
        projectId,
      );
      return ResponseUtil.success(project, 'Project retrieved successfully');
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err,
        err.HttpStatus || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  // Project proposals

  @Post('projects/:projectId/proposals')
  async createProposal(
    @CurrentUser() professional: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Body() data: CreateProposalValidation,
  ) {
    try {
      const proposal = await this.professionalsService.createProposal(
        professional.id,
        projectId,
        data,
      );
      return ResponseUtil.success(
        proposal,
        'Proposal created successfully',
        201,
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

  @Get('proposals')
  async getProfessionalProposals(
    @CurrentUser() user: User,
    @Query() query: PaginationDto,
  ) {
    try {
      const proposals = await this.professionalsService.getProposals(
        user.id,
        query,
      );
      return ResponseUtil.success(
        proposals,
        'Proposals retrieved successfully',
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

  @Get('projects/:projectId/proposals/:proposalId')
  async getProfessionalProposal(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('proposalId', new IdValidationPipe('proposal'))
    proposalId: string,
  ) {
    try {
      const proposal = await this.professionalsService.getProposalById(
        user.id,
        projectId,
        proposalId,
      );
      return ResponseUtil.success(proposal, 'Proposal retrieved successfully');
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

  @Put('projects/:projectId/proposals/:proposalId')
  async updateProfessionalProposal(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('proposalId', new IdValidationPipe('proposal'))
    proposalId: string,
    @Body() data: CreateProposalValidation,
  ) {
    try {
      const proposal = await this.professionalsService.modifyProposal(
        user.id,
        projectId,
        proposalId,
        data,
      );
      return ResponseUtil.success(proposal, 'Proposal updated successfully');
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

  @Delete('projects/:projectId/proposals/:proposalId')
  async deleteProfessionalProposal(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('proposalId', new IdValidationPipe('proposal'))
    proposalId: string,
  ) {
    try {
      const updatedProposal = await this.professionalsService.deleteProposal(
        user.id,
        projectId,
        proposalId,
      );
      return ResponseUtil.success(
        updatedProposal,
        'Proposal deleted successfully',
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
