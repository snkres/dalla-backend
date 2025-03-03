import {
  Body,
  Controller,
  Delete,
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
import { ProfessionalAuthGuard } from '@/shared/auth/platform/guards/professionals-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-auth.decorator';
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { User } from '@/prisma/postgres';
import { ProfessionalUpdateValidation } from './dto/professional-update.validation';
import { createProjectRequestValidation } from '@/projects/validation/create-request.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { IdValidationPipe } from '@/shared/pipes/id-validation.pipe';

@Controller()
@UseGuards(ProfessionalAuthGuard)
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
    const updatedProfile = await this.professionalsService.updateProfile(
      user.id,
      data,
    );
    return ResponseUtil.success(updatedProfile, 'Profile updated successfully');
  }

  @Get(':professionalId')
  async getProfessionalProfile(
    @Param('professionalId') professionalId: string,
  ) {
    const profile = await this.professionalsService.getProfile(professionalId);
    return ResponseUtil.success(profile, 'Professional profile retrieved');
  }

  @Get('projects')
  async getAllProjects(@Query() query: PaginationDto) {
    try {
      const projects = await this.professionalsService.getAllProjects(query);
      return ResponseUtil.success(
        projects,
        'All projects retrieved successfully',
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

  @Get('me/projects')
  async getAssignedProjects(
    @Param('professionalId', new IdValidationPipe('professional'))
    professionalId: string,
    @Query() query: PaginationDto,
  ) {
    try {
      const projects =
        await this.professionalsService.findProjectsByProfessionalId(
          professionalId,
          query,
        );
      return ResponseUtil.success(
        projects,
        'Assigned projects retrieved successfully',
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

  // Project requests

  @Post('me/requests')
  async createProjectRequest(
    @CurrentUser() professional: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Body() data: createProjectRequestValidation,
  ) {
    try {
      const request = await this.professionalsService.createProjectRequest(
        professional.id,
        projectId,
        data,
      );
      return ResponseUtil.success(request, 'Request created successfully', 201);
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

  @Get(':professionalId/requests')
  async getProfessionalRequests(
    @CurrentUser() user: User,
    @Query() query: PaginationDto,
  ) {
    try {
      const requests = await this.professionalsService.getRequests(
        user.id,
        query,
      );
      return ResponseUtil.success(requests, 'Requests retrieved successfully');
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
  async getProfessionalRequest(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('requestId', new IdValidationPipe('projectRequest'))
    requestId: string,
  ) {
    try {
      const request = await this.professionalsService.getRequestById(
        user.id,
        projectId,
        requestId,
      );
      return ResponseUtil.success(request, 'Request retrieved successfully');
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

  @Put('projects/:projectId/requests/:requestId')
  async updateProfessionalRequest(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('requestId', new IdValidationPipe('projectRequest'))
    requestId: string,
    @Body() data: createProjectRequestValidation,
  ) {
    try {
      const request = await this.professionalsService.modifyRequest(
        user.id,
        projectId,
        requestId,
        data,
      );
      return ResponseUtil.success(request, 'Request updated successfully');
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

  @Delete('projects/:projectId/requests/:requestId')
  async deleteProfessionalRequest(
    @CurrentUser() user: User,
    @Param('projectId', new IdValidationPipe('project')) projectId: string,
    @Param('requestId', new IdValidationPipe('projectRequest'))
    requestId: string,
  ) {
    try {
      const updatedRequest = await this.professionalsService.deleteRequest(
        user.id,
        projectId,
        requestId,
      );
      return ResponseUtil.success(
        updatedRequest,
        'Request deleted successfully',
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
