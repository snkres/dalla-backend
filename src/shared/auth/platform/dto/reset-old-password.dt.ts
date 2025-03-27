import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetOldPasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  newPassword: string;
}
