import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { OnboardingValidation } from './validation/onboarding.validation';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { ProjectService } from '@/projects/projects.service';
import { createProjectValidation } from '@/projects/validation/create-project.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { RequestStatus } from '@/prisma/postgres';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly projectService: ProjectService,
  ) {}

  async onboarding(companyId: string, onboardingData: OnboardingValidation) {
    const id = newId('companyProfile');
    await this.prisma.companyProfile.create({
      data: {
        id,
        Company: {
          connect: {
            id: companyId,
          },
        },
        ...onboardingData,
        meta: onboardingData.meta as unknown as InputJsonValue,
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
    const updatedCompanyProfile = await this.prisma.companyProfile.update({
      where: { companyId },
      data: {
        ...updateData,
        meta: updateData.meta as unknown as InputJsonValue,
      },
    });

    return updatedCompanyProfile;
  }

  async createProject(data: createProjectValidation) {
    const project = await this.projectService.createProject(data);
    return project;
  }

  async companyProjects(companyId: string, query: PaginationDto) {
    const requests = await this.projectService.findProjectsByCompanyId(
      companyId,
      query,
    );
    return requests;
  }

  async changeProjectRequest(requestId: string, status: RequestStatus) {
    const project = await this.projectService.modifyRequestStatus(
      requestId,
      status,
    );
    //? fires notifications from the service itself
    return project;
  }
}
