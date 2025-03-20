import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { Injectable, NotFoundException } from '@nestjs/common';
import { createProjectValidation } from './validation/create-project.validation';
import { ProjectStatus } from '@/prisma/postgres';
import { JsonObject } from '@prisma/client/runtime/library';
import { pagination } from 'prisma-extension-pagination';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { FilterProjectsOptions } from '@/shared/types/project.types';

@Injectable()
export class ProjectService {
  constructor(private readonly postgresService: PostgresPrismaService) {}

  async createProject(companyId: string, data: createProjectValidation) {
    const id = newId('project');
    const { meta, ...rest } = data;

    // Check if company exists
    const company = await this.postgresService.company.findUnique({
      where: {
        id: companyId,
      },
    });
    if (!company) {
      throw new NotFoundException('Company does not exist');
    }

    return this.postgresService.project.create({
      data: {
        id,
        status: ProjectStatus.Open,
        meta: meta as unknown as JsonObject,
        ...rest,
        company: {
          connect: {
            id: companyId,
          },
        },
      },
    });
  }

  async findProjectById(id: string) {
    return this.postgresService.project.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        skills: true,
        meta: true,
        createdAt: true,
        deliverables: true,
        jobTitle: true,
        scope: true,
        status: true,
        media: true,
        _count: {
          select: {
            proposals: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                projects: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
            CompanyProfile: {
              select: {
                location: true,
                logo: true,
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            username: true,
            name: true,
            UserProfile: {
              select: {
                headline: true,
                avatar: true,
                meta: true,
              },
            },
          },
        },
        proposals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            professional: {
              select: {
                id: true,
                username: true,
                name: true,
                UserProfile: {
                  select: {
                    headline: true,
                    avatar: true,
                    meta: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async index(
    professionalId: string,
    query: PaginationDto,
    options?: FilterProjectsOptions,
  ) {
    const { page, limit } = query;
    const { assigned, ...rest } = options;

    return this.postgresService
      .$extends(
        pagination({
          pages: {
            includePageCount: true,
          },
        }),
      )
      .project.paginate({
        where: {
          ...rest,
          deletedAt: null,
          approved: true,
          professional: { id: assigned ? professionalId : undefined },
        },
        select: {
          id: true,
          title: true,
          jobTitle: true,
          description: true,
          skills: true,
          meta: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
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
          proposals: {
            where: { professionalId },
          },
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  async findProjectsByCompanyId(companyId: string, query: PaginationDto) {
    const { page, limit } = query;
    return this.postgresService
      .$extends(
        pagination({
          pages: {
            includePageCount: true,
          },
        }),
      )
      .project.paginate({
        where: {
          companyId,
          deletedAt: null,
        },
        include: {
          company: true,
          professional: true,
          proposals: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
              professional: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  UserProfile: {
                    select: {
                      headline: true,
                      avatar: true,
                      meta: true,
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

  async findProjectsByProfessionalId(
    professionalId: string,
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
      .project.paginate({
        where: {
          professional: {
            id: professionalId,
          },
          deletedAt: null,
        },
        include: {
          company: true,
          professional: true,
          proposals: true,
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  async modifyProject(
    companyId: string,
    id: string,
    data: createProjectValidation,
  ) {
    const { meta, ...rest } = data;
    try {
      return this.postgresService.project.update({
        where: {
          id,
          companyId,
          deletedAt: null,
        },
        data: {
          meta: meta as unknown as JsonObject,
          ...rest,
          approved: false,
        },
      });
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException(
          'Project not found or does not belong to this company',
        );
      }
      throw err;
    }
  }

  async deleteProject(companyId: string, id: string) {
    try {
      return this.postgresService.project.update({
        where: {
          id,
          companyId,
        },
        data: {
          status: ProjectStatus.Closed,
          deletedAt: new Date(),
        },
      });
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException(
          'Project not found or does not belong to this company',
        );
      }
      throw err;
    }
  }

  async modifyProjectStatus(
    companyId: string,
    id: string,
    status: ProjectStatus,
  ) {
    try {
      // @todo refactor
      // Raw SQL is used here because Prisma does not support updating JSON fields
      return this.postgresService.$executeRaw`
      UPDATE "Project"
      SET 
        "status" = ${status}::"ProjectStatus",
        "meta" = "meta"::jsonb || CASE 
          WHEN ${status} = 'Completed' THEN jsonb_build_object('endedAt', NOW())
        END
      WHERE 
        "id" = ${id} 
        AND "companyId" = ${companyId} 
        AND "deletedAt" IS NULL;`;
    } catch (err) {
      if (err.code === 'P2025') {
        throw new NotFoundException(
          'Project not found or does not belong to this company',
        );
      }
      throw err;
    }
  }
}
