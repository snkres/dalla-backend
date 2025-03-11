import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class ProfessionalProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsUrl()
  thumbnail: string;

  @IsUrl()
  link: string;

  @IsArray()
  @IsUrl(undefined, { each: true })
  media: string[];
}
