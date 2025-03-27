import { UserTypes } from '@/shared/enums/user-types.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint()
export class AllowedOriginUrlConstraint {
  validate(text: string) {
    const origins = process.env.ORIGINS?.split(', ');
    return origins?.some((origin) => text.startsWith(origin));
  }
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserTypes)
  userType: UserTypes;

  @IsString() // Used instead of @IsUrl() because it doesn't allow localhost
  @IsNotEmpty()
  @Validate(AllowedOriginUrlConstraint, {
    message: 'invalid redirectTo URL',
  })
  redirectTo: string;
}
