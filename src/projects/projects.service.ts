import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { Injectable, NotFoundException } from '@nestjs/common';
import { createProjectValidation } from './validation/create-project.validation';
import { ProjectStatus } from '@/prisma/postgres';
import { JsonObject } from '@prisma/client/runtime/library';
import { pagination } from 'prisma-extension-pagination';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { FilterProjectsOptions } from '@/shared/types/professionals.types';

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
            requests: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                projects: true,
              },
            },
            CompanyProfile: {
              select: {
                location: true,
              },
            },
          },
        },
      },
    });
  }

  async index(query: PaginationDto, options?: FilterProjectsOptions) {
    const { page, limit } = query;
    const { professionalId, ...rest } = options;

    return this.postgresService
      .$extends(pagination())
      .project.paginate({
        where: { ...rest, professional: { id: professionalId } },
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
