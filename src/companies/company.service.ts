import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { OnboardingValidation } from './validation/onboarding.validation';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { ProjectService } from '@/projects/projects.service';
import { createProjectValidation } from '@/projects/validation/create-project.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { ProjectStatus, ProposalStatus } from '@/prisma/postgres';
import { ProposalsService } from '@/proposals/proposals.service';
import { NotificationService } from '@/notification/notification.service';
import { ReviewMilestoneSubmissionValidation } from '@/proposals/dto/review-milestone-submission.validation';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly projectService: ProjectService,
    private readonly proposalService: ProposalsService,
    private readonly notificationService: NotificationService,
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

  async getProfile(companyId: string) {
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
        createdAt: true,
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
            createdAt: true,
          },
        },
        projects: {
          where: {
            deletedAt: null,
            status: 'Open',
          },
        },
      },
    });
  }

  async getMeta(companyId: string) {
    return this.prisma.company.findFirst({
      where: { id: companyId },
      select: {
        id: true,
        email: true,
        name: true,
        onboarded: true,
        CompanyProfile: {
          select: {
            headline: true,
            logo: true,
          },
        },
        _count: {
          select: {
            projects: {
              where: {
                status: ProjectStatus.InProgress,
              },
            },
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
        meta: meta as unknown as InputJsonValue,
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
    const projects = await this.projectService.findProjectsByCompanyId(
      companyId,
      query,
    );
    return projects;
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
    const project = await this.projectService.modifyProjectStatus(
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

  // Proposals methods

  async projectProposals(
    companyId: string,
    projectId: string,
    query: PaginationDto,
  ) {
    const proposals = await this.proposalService.findProposalsByProjectId(
      companyId,
      projectId,
      query,
    );
    return proposals;
  }

  async projectProposal(
    companyId: string,
    projectId: string,
    proposalId: string,
  ) {
    const proposal = await this.proposalService.findProposalById(
      projectId,
      proposalId,
    );
    if (proposal.project.companyId !== companyId) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal;
  }

  async modifyProposalStatus(
    companyId: string,
    projectsId: string,
    proposalId: string,
    status: ProposalStatus,
  ) {
    const project = await this.proposalService.modifyProposalStatus(
      companyId,
      projectsId,
      proposalId,
      status,
    );
    //? fires notifications from the service itself
    return project;
  }

  async reviewMilestoneSubmission(
    companyId: string,
    submissionId: string,
    review: ReviewMilestoneSubmissionValidation,
  ) {
    return this.projectService.reviewMilestoneSubmission(
      companyId,
      submissionId,
      review,
    );
  }

  async reviewProjectSubmission(
    companyId: string,
    submissionId: string,
    review: ReviewMilestoneSubmissionValidation,
  ) {
    return this.projectService.reviewProjectSubmission(
      companyId,
      submissionId,
      review,
    );
  }
}
