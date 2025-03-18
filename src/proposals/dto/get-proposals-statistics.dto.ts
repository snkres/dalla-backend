import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';

export class GetProposalsStatisticsDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  from: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  to: Date;
}
