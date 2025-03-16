import parseResumeFromPdf from '@/shared/resume-parser';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { newId } from '@/shared/utils/unique-id';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { UploadService } from '@/shared/upload/upload.service';
import {
  ProfessionalEducationDto,
  UpdateProfessionalEducationDto,
} from './dto/professional-education.dto';
import { JsonValue } from '@prisma/client/runtime/library';
import { ProfessionalUpdateValidation } from './dto/professional-update.validation';
import { pagination } from 'prisma-extension-pagination';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CreateProposalValidation } from '@/projects/validation/create-proposal.validation';
import { ProposalsService } from '@/proposals/proposals.service';
import { ProjectService } from '@/projects/projects.service';
import { FilterProjectsOptions } from '@/shared/types/project.types';
import {
  ProfessionalExperienceDto,
  UpdateProfessionalExperienceDto,
} from './dto/professional-experience.dto';
import { ProfessionalProjectDto } from './dto/professional-project.dto';
import { ProjectStatus } from 'prisma/client/postgres';

@Injectable()
export class ProfessionalsService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly uploadService: UploadService,
    private readonly projectService: ProjectService,
    private readonly proposalService: ProposalsService,
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
        projects: true,
      },
    });
  }

  async getProfileByUsername(username: string) {
    return await this.prisma.userProfile.findFirst({
      where: { User: { username } },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            verified: true,
            username: true,
            projects: {
              where: {
                status: ProjectStatus.Completed,
                professional: { username },
              },
            },
          },
        },
        education: true,
        experience: true,
        projects: true,
      },
    });
  }

  async getCurrentUser(userId: string) {
    return await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        UserProfile: {
          include: { education: true, experience: true, projects: true },
        },
      },
    });
  }

  async updateProfile(
    professionalId: string,
    onboardingData: ProfessionalUpdateValidation,
  ) {
    const { education, experience, meta, ...rest } = onboardingData;
    const mappedEducation = this.mapEducationData(education);
    const mappedExperience = this.mapExperienceData(experience);

    try {
      const updatedProfile = await this.prisma.userProfile.update({
        where: { userId: professionalId },
        data: {
          ...rest,
          meta: meta as unknown as JsonValue,
          // Add the new ones, update the existing ones, and delete the rest
          education: {
            deleteMany: {
              id: { notIn: mappedEducation.map((edu) => edu.id) },
            },
            upsert: mappedEducation.map((edu) => ({
              where: { id: edu.id },
              update: edu,
              create: edu,
            })),
          },
          experience: {
            deleteMany: {
              id: { notIn: mappedExperience.map((exp) => exp.id) },
            },
            upsert: mappedExperience.map((exp) => ({
              where: { id: exp.id },
              update: exp,
              create: exp,
            })),
          },
        },
        include: {
          education: true,
          experience: true,
          User: {
            select: {
              id: true,
              email: true,
              name: true,
              verified: true,
              username: true,
            },
          },
        },
      });

      return updatedProfile;
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException('Profile not found');
      }
      throw err;
    }
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

  private mapEducationData(
    education: ProfessionalEducationDto[] | UpdateProfessionalEducationDto[],
  ) {
    return education?.map((edu) => ({
      ...edu,
      id: edu?.id ?? newId('professionalEducation'),
    }));
  }

  private mapExperienceData(
    experience: ProfessionalExperienceDto[] | UpdateProfessionalExperienceDto[],
  ) {
    return experience?.map((exp) => ({
      ...exp,
      id: exp.id ?? newId('professionalExperience'),
      meta: exp.meta as unknown as JsonValue,
    }));
  }

  async createProfessionalProject(
    professionalId: string,
    data: ProfessionalProjectDto,
  ) {
    const id = newId('professionalProject');
    return this.prisma.userProject.create({
      data: {
        ...data,
        id,
        UserProfile: { connect: { userId: professionalId } },
      },
    });
  }

  async updateProfessionalProject(
    professionalId: string,
    professionalProjectId: string,
    data: ProfessionalProjectDto,
  ) {
    return this.prisma.userProject.update({
      where: {
        id: professionalProjectId,
        UserProfile: { userId: professionalId },
      },
      data,
    });
  }

  async deleteProfessionalProject(professionalId: string, projectId: string) {
    return this.prisma.userProject.delete({
      where: { id: projectId, UserProfile: { userId: professionalId } },
    });
  }

  async getProjects(
    professionalId: string,
    query: PaginationDto,
    assigned: boolean = false,
  ) {
    const options: FilterProjectsOptions = {
      status: 'Open',
      assigned,
    };
    const projects = await this.projectService.index(
      professionalId,
      query,
      options,
    );

    return projects[0].map((project) => {
      const applied = project.proposals.length > 0;
      const {
        proposals: {},
        ...rest
      } = project;
      return { ...rest, applied };
    });
  }

  async getProjectById(professionalId: string, projectId: string) {
    const project = await this.projectService.findProjectById(projectId);
    const professionalProposals = project.proposals.filter(
      (proposal) => proposal.professionalId === professionalId,
    );

    const {
      proposals: {},
      ...rest
    } = project;
    return {
      ...rest,
      applied: professionalProposals.length > 0,
    };
  }

  // Proposals methods

  async createProposal(
    professionalId: string,
    projectId: string,
    proposal: CreateProposalValidation,
  ) {
    return this.proposalService.createProposal(
      professionalId,
      projectId,
      proposal,
    );
  }

  async getProposals(professionalId: string, query: PaginationDto) {
    return this.proposalService.findProposalByProfessionalId(
      professionalId,
      query,
    );
  }

  async getProposalById(
    professionalId: string,
    projectId: string,
    proposalId: string,
  ) {
    const proposal = await this.proposalService.findProposalById(
      projectId,
      proposalId,
    );
    if (proposal.professionalId !== professionalId) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal;
  }

  async modifyProposal(
    professionalId: string,
    projectId: string,
    proposalId: string,
    data: CreateProposalValidation,
  ) {
    return this.proposalService.modifyProposal(
      professionalId,
      projectId,
      proposalId,
      data,
    );
  }

  async deleteProposal(
    professionalId: string,
    projectId: string,
    proposalId: string,
  ) {
    return this.proposalService.deleteProposal(
      professionalId,
      projectId,
      proposalId,
    );
  }
}
