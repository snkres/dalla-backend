import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class CompanyRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  domain: string;

  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  password: string;
}
