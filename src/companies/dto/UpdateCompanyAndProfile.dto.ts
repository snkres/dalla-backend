import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateCompanyAndProfileDto {
  // Company fields
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  size?: string;
  // CompanyProfile fields
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  areas?: string[];

  @IsOptional()
  @IsArray()
  goals?: string[];

  @IsOptional()
  @IsArray()
  targetIndustries?: string[];

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
