import { PaginationDto } from '@/shared/dto/pagination.dto';
import { IsOptional } from 'class-validator';

export class FetchProjectsOptionsDto extends PaginationDto {
  @IsOptional()
  assigned: boolean = false;
}
