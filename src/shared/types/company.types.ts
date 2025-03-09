import { IsNotEmpty, IsObject, IsPhoneNumber, IsString } from 'class-validator';

export class CompanyProfileMeta {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  size: string;

  @IsString()
  industry: string;

  @IsString()
  type: string;

  @IsObject()
  @IsNotEmpty()
  socialLinks: Map<string, string>;
}
