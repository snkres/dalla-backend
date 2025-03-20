import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { ProjectStatus, Proposal, ProposalStatus } from '@/prisma/postgres';
import { CreateProposalValidation } from '@/proposals/dto/create-proposal.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { ProposalStatistics } from '@/shared/types/proposal.types';
import { newId } from '@/shared/utils/unique-id';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pagination } from 'prisma-extension-pagination';

@Injectable()
export class ProposalsService {
  constructor(private readonly postgresService: PostgresPrismaService) {}

  async createProposal(
    professionalId: string,
    projectId: string,
    data: CreateProposalValidation,
  ) {
    const id = newId('proposal');
    const { relevantProjects, ...rest } = data;
    try {
      const proposals = await this.postgresService.proposal.findMany({
        where: {
          professionalId,
          projectId,
          deletedAt: null,
        },
      });
      if (proposals.some((p) => p.deletedAt === null)) {
        throw new BadRequestException('Proposal already exists');
      }

      return this.postgresService.proposal.create({
        data: {
          id,
          ...rest,
          professional: {
            connect: {
              id: professionalId,
            },
          },
          project: {
            connect: {
              id: projectId,
            },
          },
          relevantProjects: {
            connect: relevantProjects.map((projectId) => ({ id: projectId })),
          },
        },
        include: {
          professional: true,
          project: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Proposal already exists');
      } else if (error.code === 'P2016') {
        throw new BadRequestException('Professional or project not found');
      }
      throw error;
    }
  }

  async findProposalsByProjectId(
    companyId: string,
    projectId: string,
    query: PaginationDto,
  ) {
    const { page, limit } = query;

    return this.postgresService
      .$extends(
        pagination({
          pages: {
            includePageCount: true,
          },
        }),
      )
      .proposal.paginate({
        where: {
          projectId,
          deletedAt: null,
          project: {
            companyId,
          },
        },
        include: {
          professional: true,
          relevantProjects: true,
        },
      })
      .withPages({
        page,
        limit,
      });
  }

  async findProposalByProfessionalId(
    professionalId: string,
    query: PaginationDto,
  ) {
    const { limit, page } = query;
    return this.postgresService
      .$extends(
        pagination({
          pages: {
            includePageCount: true,
          },
        }),
      )
      .proposal.paginate({
        where: {
          professionalId,
          deletedAt: null,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          projectId: true,
          project: {
            select: {
              id: true,
              title: true,
              meta: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  CompanyProfile: {
                    select: {
                      meta: true,
                      location: true,
                      logo: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  async findProposalById(projectId: string, proposalId: string) {
    const proposal = await this.postgresService.proposal.findUnique({
      where: {
        id: proposalId,
        projectId,
        deletedAt: null,
      },
      include: {
        professional: true,
        project: {
          include: {
            company: {
              select: {
                name: true,
                CompanyProfile: {
                  select: {
                    meta: true,
                    location: true,
                  },
                },
              },
            },
            _count: {
              select: {
                proposals: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
        relevantProjects: true,
      },
    });

    if (!proposal) {
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
    const { relevantProjects, ...rest } = data;
    try {
      return this.postgresService.proposal.update({
        where: {
          professionalId,
          projectId,
          id: proposalId,
          deletedAt: null,
        },
        data: {
          ...rest,
          relevantProjects: {
            connect: relevantProjects.map((projectId) => ({ id: projectId })),
          },
        },
        include: {
          relevantProjects: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2025') {
        throw new BadRequestException(
          'Proposal not found or does not belong to this professional',
        );
      }
      throw err;
    }
  }

  async modifyProposalStatus(
    companyId: string,
    projectId: string,
    proposalId: string,
    status: ProposalStatus,
  ) {
    return this.postgresService.$transaction(async () => {
      let proposal: Proposal | null = null;
      try {
        proposal = await this.postgresService.proposal.update({
          where: {
            id: proposalId,
            projectId,
            deletedAt: null,
            project: {
              companyId,
            },
          },
          data: {
            status,
          },
          include: {
            relevantProjects: true,
          },
        });
      } catch (err) {
        if (err.code === 'P2025') {
          throw new BadRequestException(
            'Proposal not found or does not belong to this company',
          );
        }
        throw err;
      }

      if (status === ProposalStatus.Accepted) {
        await this.connectProfessionalToProject(
          proposal.projectId,
          proposal.professionalId,
          proposal as Proposal,
        );

        await this.rejectOtherProposals(proposal.projectId, proposalId);
      }
      return proposal;
    });
  }

  private async connectProfessionalToProject(
    projectId: string,
    professionalId: string,
    proposal: Proposal,
  ) {
    return this.postgresService.project.update({
      where: {
        id: projectId,
        status: ProjectStatus.Open,
      },
      data: {
        status: ProjectStatus.InProgress,
        meta: {
          budget: proposal.price,
          timeline: proposal.timeline,
          startedAt: new Date(),
        },
        professional: {
          connect: {
            id: professionalId,
          },
        },
      },
    });
  }

  private async rejectOtherProposals(projectId: string, proposalId: string) {
    return this.postgresService.proposal.updateMany({
      where: {
        projectId,
        id: {
          not: proposalId,
        },
        deletedAt: null,
      },
      data: {
        status: ProposalStatus.Rejected,
      },
    });
  }

  async deleteProposal(
    professionalId: string,
    projectId: string,
    proposalId: string,
  ) {
    try {
      return this.postgresService.proposal.update({
        where: {
          professionalId,
          projectId,
          id: proposalId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (err) {
      if (err.code === 'P2025') {
        throw new BadRequestException(
          'Proposal not found or does not belong to this professional',
        );
      }
      throw err;
    }
  }

  async getStatistics(
    professionalId: string,
    from: Date,
    to: Date,
  ): Promise<ProposalStatistics> {
    const proposalStats = await this.postgresService.proposal.groupBy({
      by: ['status'],
      where: {
        professionalId,
        deletedAt: null,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _count: true,
    });

    // Calculate total and accepted proposals from the results
    let totalProposals = 0;
    let acceptedProposals = 0;
    proposalStats.forEach((stat) => {
      totalProposals += stat._count;
      if (stat.status === ProposalStatus.Accepted) {
        acceptedProposals = stat._count;
      }
    });

    return {
      totalProposals,
      acceptedProposals,
      successRate:
        totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0,
      interviews: 0, // Will be handled later
    };
  }
}
