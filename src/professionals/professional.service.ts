import parseResumeFromPdf from '@/shared/resume-parser';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { newId } from '@/shared/utils/unique-id';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { UploadService } from '@/shared/upload/upload.service';
import { ProfessionalEducationDto } from './dto/professional-education.dto';
import { JsonValue } from '@prisma/client/runtime/library';
import { ProfessionalUpdateValidation } from './dto/professional-update.validation';
import { pagination } from 'prisma-extension-pagination';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { createProjectRequestValidation } from '@/projects/validation/create-request.validation';
import { ProjectRequestsService } from '@/project-requests/project-requests.service';
import { ProjectService } from '@/projects/projects.service';
import { FilterProjectsOptions } from '@/shared/types/professionals.types';

@Injectable()
export class ProfessionalsService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly uploadService: UploadService,
    private readonly projectService: ProjectService,
    private readonly projectRequestsService: ProjectRequestsService,
  ) {}

  async listProfessionals(query: PaginationDto) {
    return await this.prisma
      .$extends(pagination())
      .userProfile.paginate({
        where: { User: { onboarded: true, suspended: false } },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          education: true,
          experience: true,
        },
      })
      .withPages({
        limit: query.limit,
        page: query.page,
      });
  }

  async parseResume(file: Express.Multer.File) {
    const resumeUrl = await this.uploadService.uploadFile(file);
    const parsedResume = await parseResumeFromPdf(file.buffer);
    return { ...parsedResume, url: resumeUrl };
  }

  async onboarding(
    professionalId: string,
    onboardingData: ProfessionalOnboardingDto,
  ) {
    const profile = await this.createUserProfile(
      professionalId,
      onboardingData,
    );
    return profile;
  }

  async getProfile(professionalId: string) {
    return await this.prisma.userProfile.findFirst({
      where: { userId: professionalId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            verified: true,
            username: true,
          },
        },
        education: true,
        experience: true,
      },
    });
  }

  async getCurrentUser(userId: string) {
    return await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        UserProfile: {
          include: { education: true, experience: true },
        },
      },
    });
  }

  async updateProfile(
    professionalId: string,
    onboardingData: ProfessionalUpdateValidation,
  ) {
    const profile = await this.prisma.userProfile.findFirst({
      where: { userId: professionalId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        ...onboardingData,
        meta: onboardingData.meta as unknown as JsonValue,
      },
    });

    return await this.getProfile(professionalId);
  }

  private async createUserProfile(
    professionalId: string,
    onboardingData: ProfessionalOnboardingDto,
  ) {
    const profile = await this.prisma.userProfile.create({
      data: {
        User: { connect: { id: professionalId } },
        ...onboardingData,
        id: newId('professionalProfile'),
        meta: onboardingData.meta as unknown as JsonValue,
        education: { create: this.mapEducationData(onboardingData.education) },
        experience: {
          create: this.mapExperienceData(onboardingData.experience),
        },
      },
      include: { education: true, experience: true, User: true },
    });

    await this.prisma.user.update({
      where: { id: professionalId },
      data: { onboarded: true },
    });

    profile.User.onboarded = true;
    return profile;
  }

  private mapEducationData(education: ProfessionalEducationDto[]) {
    return education?.map((edu) => ({
      ...edu,
      id: newId('professionalEducation'),
    }));
  }

  private mapExperienceData(experience: any[]) {
    return experience?.map((exp) => ({
      ...exp,
      id: newId('professionalExperience'),
      meta: exp.meta as unknown as JsonValue,
    }));
  }

  async getProjects(
    professionalId: string,
    query: PaginationDto,
    assigned: boolean = false,
  ) {
    const options: FilterProjectsOptions = assigned ? { professionalId } : {};
    return this.projectService.index(query, options);
  }

  // Project requests methods

  async createProjectRequest(
    professionalId: string,
    projectId: string,
    request: createProjectRequestValidation,
  ) {
    return this.projectRequestsService.createRequest(
      professionalId,
      projectId,
      request,
    );
  }

  async getRequests(professionalId: string, query: PaginationDto) {
    return this.projectRequestsService.findRequestByProfessionalId(
      professionalId,
      query,
    );
  }

  async getRequestById(
    professionalId: string,
    projectId: string,
    requestId: string,
  ) {
    const request = await this.projectRequestsService.findRequestById(
      projectId,
      requestId,
    );
    if (request.professionalId !== professionalId) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async modifyRequest(
    professionalId: string,
    projectId: string,
    requestId: string,
    data: createProjectRequestValidation,
  ) {
    return this.projectRequestsService.modifyRequest(
      professionalId,
      projectId,
      requestId,
      data,
    );
  }

  async deleteRequest(
    professionalId: string,
    projectId: string,
    requestId: string,
  ) {
    return this.projectRequestsService.deleteRequest(
      professionalId,
      projectId,
      requestId,
    );
  }
}
