import { UserTypes } from '@/shared/enums/user-types.enum';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserTypes)
  userType: UserTypes;
}
