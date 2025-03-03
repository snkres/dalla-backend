import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Prisma, ProjectStatus, RequestStatus } from '@/prisma/postgres';
import { createProjectRequestValidation } from '@/projects/validation/create-request.validation';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { newId } from '@/shared/utils/unique-id';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pagination } from 'prisma-extension-pagination';

@Injectable()
export class ProjectRequestsService {
  constructor(private readonly postgresService: PostgresPrismaService) {}

  async createRequest(
    professionalId: string,
    projectId: string,
    data: createProjectRequestValidation,
  ) {
    const id = newId('projectRequest');
    try {
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
              id: projectId,
            },
          },
        },
        include: {
          professional: true,
          project: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Request already exists');
      } else if (error.code === 'P2016') {
        throw new BadRequestException('Professional or project not found');
      }
      throw error;
    }
  }

  async findRequestByProjectId(
    companyId: string,
    projectId: string,
    query: PaginationDto,
  ) {
    const { page, limit } = query;

    return this.postgresService
      .$extends(pagination())
      .professionalRequests.paginate({
        where: {
          projectId,
          project: {
            companyId,
          },
        },
        include: {
          professional: true,
        },
      })
      .withPages({
        page,
        limit,
      });
  }

  async findRequestByProfessionalId(
    professionalId: string,
    query: PaginationDto,
  ) {
    const { limit, page } = query;
    return this.postgresService
      .$extends(pagination())
      .professionalRequests.paginate({
        where: {
          professionalId,
        },
        include: {
          project: true,
        },
      })
      .withPages({
        limit,
        page,
      });
  }

  async findRequestById(projectId: string, requestId: string) {
    const request = await this.postgresService.professionalRequests.findUnique({
      where: {
        id: requestId,
        projectId,
      },
      include: {
        professional: true,
        project: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async modifyRequest(
    professionalId: string,
    projectId: string,
    requestId: string,
    data: createProjectRequestValidation,
  ) {
    try {
      return this.postgresService.professionalRequests.update({
        where: {
          professionalId,
          projectId,
          id: requestId,
        },
        data: {
          description: data.description,
        },
      });
    } catch (err) {
      if (err.code === 'P2025') {
        throw new BadRequestException(
          'Request not found or does not belong to this professional',
        );
      }
      throw err;
    }
  }

  async modifyRequestStatus(
    companyId: string,
    projectId: string,
    requestId: string,
    status: RequestStatus,
  ) {
    return this.postgresService.$transaction(async () => {
      let request: Prisma.ProfessionalRequestsMaxAggregateOutputType | null =
        null;
      try {
        request = await this.postgresService.professionalRequests.update({
          where: {
            id: requestId,
            projectId,
            project: {
              companyId,
            },
          },
          data: {
            status,
          },
        });
      } catch (err) {
        if (err.code === 'P2025') {
          throw new BadRequestException(
            'Request not found or does not belong to this company',
          );
        }
        throw err;
      }

      if (status === RequestStatus.Accepted) {
        await this.connectProfessionalToProject(
          request.projectId,
          request.professionalId,
        );

        await this.rejectOtherRequests(request.projectId, requestId);
      }
      return request;
    });
  }

  private async connectProfessionalToProject(
    projectId: string,
    professionalId: string,
  ) {
    return this.postgresService.project.update({
      where: {
        id: projectId,
        status: ProjectStatus.Open,
      },
      data: {
        status: ProjectStatus.InProgress,
        professional: {
          connect: {
            id: professionalId,
          },
        },
      },
    });
  }

  private async rejectOtherRequests(projectId: string, requestId: string) {
    return this.postgresService.professionalRequests.updateMany({
      where: {
        projectId,
        id: {
          not: requestId,
        },
      },
      data: {
        status: RequestStatus.Rejected,
      },
    });
  }

  async deleteRequest(
    professionalId: string,
    projectId: string,
    requestId: string,
  ) {
    try {
      return this.postgresService.professionalRequests.update({
        where: {
          professionalId,
          projectId,
          id: requestId,
        },
        data: {
          status: RequestStatus.Rejected,
        },
      });
    } catch (err) {
      if (err.code === 'P2025') {
        throw new BadRequestException(
          'Request not found or does not belong to this professional',
        );
      }
      throw err;
    }
  }
}
