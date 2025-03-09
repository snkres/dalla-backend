import { UserTypes } from '@/shared/enums/user-types.enum';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(private readonly jwtService: JwtService) {}

  async createTokens(payload: {
    email: string;
    userId: string;
    type: UserTypes;
    extra?: Record<string, any>;
  }) {
    const access_token = await this.createAccessToken({
      email: payload.email,
      userId: payload.userId,
      type: payload.type,
      ...payload.extra,
    });

    const refresh_token = await this.createRefreshToken({
      email: payload.email,
      userId: payload.userId,
      type: payload.type,
      access_token: access_token,
      ...payload.extra,
    });

    return { access_token, refresh_token, extra: payload.extra };
  }

  async createRefreshToken(payload: {
    email: string;
    userId: string;
    type: UserTypes;
    access_token: string;
  }) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  }

  async createAccessToken(payload: {
    email: string;
    userId: string;
    type: UserTypes;
  }) {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '10s',
    });
  }

  async decodeAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async decodeRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async validateAndDecodeRefreshToken(
    refresh_token: string,
    access_token: string,
  ) {
    const decoded = await this.decodeRefreshToken(refresh_token);
    if (!decoded || decoded.access_token !== access_token) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    return decoded;
  }
}
