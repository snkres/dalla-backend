import { UserTypes } from '@/shared/enums/user-types.enum';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @Length(4)
  @IsNotEmpty()
  otp: string;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  userType: UserTypes;
}
