import { UserTypes } from '@/shared/enums/user-types.enum';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterValidation {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message:
      'Username must only contain letters and numbers without spaces or symbols',
  })
  @MinLength(4)
  @ValidateIf((o) => o.userType === UserTypes.Professional)
  username: string;

  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  password: string;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  userType: UserTypes;
}
