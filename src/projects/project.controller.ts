import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectService } from './projects.service';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CompanyOrProfessionalAuthGuard } from '@/shared/auth/platform/guards/company-or-professional-auth.guard';

@Controller('projects')
@UseGuards(CompanyOrProfessionalAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects(@Query() query: PaginationDto) {
    const result = await this.projectService.index(query);
    return ResponseUtil.success(result);
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    const result = await this.projectService.findProjectById(id);
    return ResponseUtil.success(result);
  }
}
