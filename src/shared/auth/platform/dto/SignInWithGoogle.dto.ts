import { UserTypes } from '@/shared/enums/user-types.enum';
import { IsEnum, IsString } from 'class-validator';

export class SignInWithGoogle {
  @IsString()
  idToken: string;

  @IsEnum(UserTypes)
  userType: UserTypes;
}
