import { IsExist } from '@/shared/decorators/isExist.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class createProjectRequestValidation {
  @IsString()
  @IsNotEmpty()
  @IsExist('Project', 'id')
  projectId: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
