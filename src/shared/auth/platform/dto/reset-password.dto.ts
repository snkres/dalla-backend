import { UserTypes } from '@/shared/enums/user-types.enum';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsEnum(UserTypes)
  userType: UserTypes;

  @IsString()
  code: string;

  @IsString()
  @Length(6, 20)
  newPassword: string;
}
