import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { NotificationService } from '@/notification/notification.service';
import {
  ProjectStatus,
  Proposal,
  ProposalStatus,
  ProposalType,
} from '@/prisma/postgres';
import { CreateProposalValidation } from '@/proposals/dto/create-proposal.validation';
import { CreateMilestoneValidation } from '@/proposals/dto/create-milestone.validation';
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
  constructor(
    private readonly postgresService: PostgresPrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createProposal(
    professionalId: string,
    projectId: string,
    data: CreateProposalValidation,
  ) {
    const id = newId('proposal');
    const { relevantProjects, milestones, type, ...rest } = data;

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

      const baseCreateData = {
        id,
        type,
        description: rest.description,
        media: rest.media,
        price: rest.price,
        timeline: rest.timeline,
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
      };

      if (type === ProposalType.MilestoneBased) {
        const totalPrice = milestones.reduce((sum, m) => sum + m.price, 0);
        const totalTimeline = this.calculateTotalTimeline(milestones);

        return this.postgresService.proposal.create({
          data: {
            ...baseCreateData,
            price: totalPrice,
            timeline: totalTimeline,
            milestones: {
              create: milestones.map((milestone) => ({
                id: newId('milestone'),
                ...milestone,
              })),
            },
          },
          include: {
            professional: true,
            project: true,
            milestones: true,
          },
        });
      }

      return this.postgresService.proposal.create({
        data: baseCreateData,
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

  private calculateTotalTimeline(
    milestones: CreateMilestoneValidation[],
  ): string {
    let totalDays = 0;

    milestones.forEach((milestone) => {
      // It's guaranteed that timeline is in the format "{number} {unit}"
      const [amount, unit] = milestone.timeline.split(' ');
      const numericAmount = parseInt(amount, 10);

      switch (unit.toLowerCase()) {
        case 'day':
          totalDays += numericAmount;
          break;
        case 'week':
          totalDays += numericAmount * 7;
          break;
        case 'month':
          totalDays += numericAmount * 30;
          break;
      }
    });

    // Convert total days to the most appropriate unit
    if (totalDays >= 60) {
      // Use months for 60+ days
      const months = Math.ceil(totalDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (totalDays >= 14) {
      // Use weeks for 14+ days
      const weeks = Math.ceil(totalDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    // Use days for anything less than 2 weeks
    return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
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
                    logo: true,
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
        milestones: true,
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
    const { relevantProjects, milestones: _, ...rest } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
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
            project: true,
            relevantProjects: true,
            milestones: true,
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
          proposal,
        );

        await this.rejectOtherProposals(proposal.projectId, proposalId);
      }

      await this.notificationService.notify({
        userId: proposal.professionalId,
        type: 'EVENT',
        metadata: {
          type: 'PROPOSAL',
          professionalId: proposal.professionalId,
        },
        title: `Your proposal for ${'need to match the project name'} was ${status}`,
        content: 'Check your dashboard for more details',
      });
      return proposal;
    });
  }

  private async connectProfessionalToProject(
    projectId: string,
    professionalId: string,
    proposal: Proposal,
  ) {
    const meta: any = {
      budget: proposal.price,
      timeline: proposal.timeline,
      startedAt: new Date(),
    };

    return this.postgresService.project.update({
      where: {
        id: projectId,
        status: ProjectStatus.Open,
      },
      data: {
        status: ProjectStatus.InProgress,
        meta,
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
