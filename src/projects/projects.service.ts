import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { Injectable } from '@nestjs/common';
import { createProjectValidation } from './validation/create-project.validation';
import { ProjectStatus, RequestStatus } from '@/prisma/postgres';
import { JsonObject } from '@prisma/client/runtime/library';
import { createProjectRequestValidation } from './validation/create-request.validation';
import { pagination } from 'prisma-extension-pagination';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly postgresService: PostgresPrismaService) {}

  index(query: PaginationDto) {
    const { page, limit } = query;

    return this.postgresService
      .$extends(pagination())
      .project.paginate({
        include: {
          company: true,
          professional: true,
          requests: true,
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  findProjectsByCompanyId(companyId: string, query: PaginationDto) {
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
          requests: true,
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  findProjectsByProfessionalId(professionalId: string, query: PaginationDto) {
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
          requests: true,
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  createProject(data: createProjectValidation) {
    const id = newId('project');
    const { companyId, meta, ...rest } = data;
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

  findProjectById(id: string) {
    return this.postgresService.project.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
        requests: true,
        professional: true,
      },
    });
  }

  changeProjectStatus(id: string, status: ProjectStatus) {
    return this.postgresService.project.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  createRequest(professionalId: string, data: createProjectRequestValidation) {
    const id = newId('projectRequest');
    return this.postgresService.professionalRequests.create({
      data: {
        id,
        status: RequestStatus.Pending,
        description: data.description,
        professional: {
          connect: {
            id: professionalId,
          },
        },
        project: {
          connect: {
            id: data.projectId,
          },
        },
      },
      include: {
        professional: true,
        project: true,
      },
    });
  }

  async modifyRequestStatus(requestId: string, status: RequestStatus) {
    const request = await this.postgresService.professionalRequests.update({
      where: {
        id: requestId,
      },
      data: {
        status,
      },
    });

    if (status === RequestStatus.Accepted) {
      await this.postgresService.project.update({
        where: {
          id: request.projectId,
        },
        data: {
          status: ProjectStatus.InProgress,
          professional: {
            connect: {
              id: request.professionalId,
            },
          },
        },
      });
    }
    return request;
  }
}
