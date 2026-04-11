import { UserTypes } from '@/shared/enums/user-types.enum';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  password: string;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  userType: UserTypes;
}
