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
        _count: {
          select: {
            proposals: {
              where: {
                deletedAt: null,
              }
            }
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
                  }
                },
              },
            },
            CompanyProfile: {
              select: {
                location: true,
              },
            },
          },
        },
        proposals: true,
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
      .$extends(pagination())
      .project.paginate({
        where: {
          ...rest,
          deletedAt: null,
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
      .$extends(pagination())
      .project.paginate({
        where: {
          companyId,
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

  async findProjectsByProfessionalId(
    professionalId: string,
    query: PaginationDto,
  ) {
    const { page, limit } = query;
    return this.postgresService
      .$extends(pagination())
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

  async changeProjectStatus(
    companyId: string,
    id: string,
    status: ProjectStatus,
  ) {
    try {
      return this.postgresService.project.update({
        where: {
          id,
          companyId,
          deletedAt: null,
        },
        data: {
          status,
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
}
