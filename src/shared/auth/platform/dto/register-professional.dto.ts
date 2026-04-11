import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ProfessionalRegisterDto {
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
  username: string;

  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  password: string;
}
