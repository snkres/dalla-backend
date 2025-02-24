import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProjectService } from './projects.service';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { ResponseUtil } from '@/shared/utils/response.util';
import { ProfessionalAuthGuard } from '@/shared/auth/platform/guards/professionals-auth.guard';
import { CompanyAuthGuard } from '@/shared/auth/platform/guards/company-auth.guard';

@Controller('projects')
@UseGuards(CompanyAuthGuard, ProfessionalAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects(@Query() query: PaginationDto) {
    const result = this.projectService.index(query);
    return ResponseUtil.success(result);
  }

  @Get(':id')
  getProjectById(@Query('id') id: string) {
    const result = this.projectService.findProjectById(id);
    return ResponseUtil.success(result);
  }
}
