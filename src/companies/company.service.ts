import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { OnboardingValidation } from './validation/onboarding.validation';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { ProjectService } from '@/projects/projects.service';
import { createProjectValidation } from '@/projects/validation/create-project.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { RequestStatus } from '@/prisma/postgres';
import { ProjectStatus } from '@/shared/types/project.types';
import { ProjectRequestsService } from '@/project-requests/project-requests.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly projectService: ProjectService,
    private readonly projectRequestsService: ProjectRequestsService,
  ) {}

  async onboarding(companyId: string, onboardingData: OnboardingValidation) {
    const id = newId('companyProfile');
    const { areas, goals, targetIndustries, meta, ...rest } = onboardingData;

    await this.prisma.companyProfile.create({
      data: {
        id,
        Company: {
          connect: {
            id: companyId,
          },
        },
        ...rest,
        areas: areas as unknown as InputJsonValue[],
        goals: goals as unknown as InputJsonValue[],
        targetIndustries: targetIndustries as unknown as InputJsonValue[],
        meta: meta as unknown as InputJsonValue,
      },
      include: {
        Company: true,
      },
    });
    return this.prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        onboarded: true,
      },
      include: {
        CompanyProfile: true,
      },
    });
  }

  async getCompanyProfile(companyId: string) {
    return this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        domain: true,
        // industry: true,
        // size: true,
        onboarded: true,
        suspended: true,
        verified: true,
        CompanyProfile: {
          select: {
            location: true,
            areas: true,
            goals: true,
            targetIndustries: true,
            website: true,
            headline: true,
            bio: true,
            logo: true,
            meta: true,
          },
        },
      },
    });
  }

  async updateCompanyProfile(
    companyId: string,
    updateData: OnboardingValidation,
  ) {
    const { areas, goals, targetIndustries, meta, ...rest } = updateData;
    const updatedCompanyProfile = await this.prisma.companyProfile.update({
      where: { companyId },
      data: {
        ...rest,
        areas: areas as unknown as InputJsonValue[],
        goals: goals as unknown as InputJsonValue[],
        targetIndustries: targetIndustries as unknown as InputJsonValue[],
        meta: updateData.meta as unknown as InputJsonValue,
      },
    });

    return updatedCompanyProfile;
  }

  // Project methods

  async createProject(companyId: string, data: createProjectValidation) {
    const project = await this.projectService.createProject(companyId, data);
    return project;
  }

  async companyProject(projectId: string) {
    const project = await this.projectService.findProjectById(projectId);
    return project;
  }

  async companyProjects(companyId: string, query: PaginationDto) {
    const requests = await this.projectService.findProjectsByCompanyId(
      companyId,
      query,
    );
    return requests;
  }

  async modifyProject(
    companyId: string,
    projectId: string,
    data: createProjectValidation,
  ) {
    const project = await this.projectService.modifyProject(
      companyId,
      projectId,
      data,
    );
    return project;
  }

  async modifyProjectStatus(
    companyId: string,
    projectId: string,
    status: ProjectStatus,
  ) {
    const project = await this.projectService.changeProjectStatus(
      companyId,
      projectId,
      status,
    );
    return project;
  }

  async deleteProject(companyId: string, projectId: string) {
    const project = await this.projectService.deleteProject(
      companyId,
      projectId,
    );
    return project;
  }

  // Project requests methods

  async projectRequests(
    companyId: string,
    projectId: string,
    query: PaginationDto,
  ) {
    const requests = await this.projectRequestsService.findRequestByProjectId(
      companyId,
      projectId,
      query,
    );
    return requests;
  }

  async projectRequest(
    companyId: string,
    projectId: string,
    requestId: string,
  ) {
    const request = await this.projectRequestsService.findRequestById(
      projectId,
      requestId,
    );
    if (request.project.companyId !== companyId) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async modifyRequestStatus(
    companyId: string,
    projectsId: string,
    requestId: string,
    status: RequestStatus,
  ) {
    const project = await this.projectRequestsService.modifyRequestStatus(
      companyId,
      projectsId,
      requestId,
      status,
    );
    //? fires notifications from the service itself
    return project;
  }
}
