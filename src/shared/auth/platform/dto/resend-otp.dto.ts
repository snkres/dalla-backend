import { UserTypes } from '@/shared/enums/user-types.enum';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  userType: UserTypes;
}
