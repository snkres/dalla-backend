import { IsNotEmpty, IsString } from 'class-validator';

export class createProjectRequestValidation {
  @IsString()
  @IsNotEmpty()
  description: string;
}
