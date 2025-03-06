import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refresh_token: string;

  @IsNotEmpty()
  @IsJWT()
  access_token: string;
}
