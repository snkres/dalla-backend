import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreateProposalValidation {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  timeline: string;

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsArray()
  @IsString({ each: true })
  relevantProjects: string[];
}
