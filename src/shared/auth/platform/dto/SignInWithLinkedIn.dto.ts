import { UserTypes } from '@/shared/enums/user-types.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SignInWithLinkedInDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(UserTypes)
  userType: UserTypes;

  @IsString()
  @IsNotEmpty()
  redirectUrl: string;
}
