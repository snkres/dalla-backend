import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PinoLogger } from 'nestjs-pino';
import { IS_PUBLIC_KEY } from '@/shared/decorators/isPublic.decorator';
import { UserTypes } from '@/shared/enums/user-types.enum';
import setResponseCookies from '../utils/set-response-cookies';
import { JWTService } from '../../miscs/jwt';

/**
 * If type is not provided, both user and company will be accepted
 */
export function AuthGuard(type?: UserTypes) {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    public readonly logger = new PinoLogger({
      renameContext: AuthGuard.name,
    });
    type: UserTypes;

    constructor(
      public jwtService: JWTService,
      public reflector: Reflector,
      public prisma: PostgresPrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      this.type = type;
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      const { accessToken, refreshToken } =
        this.extractTokensFromCookies(request);

      let payload;
      try {
        payload = await this.jwtService.decodeAccessToken(accessToken);
        this.type ??= this.determineType(payload.userId);
      } catch (error) {
        return this.handleTokenErrors(
          error,
          refreshToken,
          accessToken,
          request,
          response,
        );
      }

      const record = await this.prisma[this.type as string].findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (record) {
        request[this.type] = record;
        return true;
      } else {
        this.logger.error('Record not found');
        throw new UnauthorizedException('Invalid token');
      }
    }

    async handleTokenErrors(
      error: any,
      refreshToken: string,
      accessToken: string,
      request: Request,
      response: Response,
    ): Promise<boolean> {
      if (refreshToken) {
        try {
          const refreshPayload =
            await this.jwtService.validateAndDecodeRefreshToken(
              refreshToken,
              accessToken,
            );
          this.type ??= this.determineType(refreshPayload.userId);

          const record = await this.prisma[this.type as string].findUnique({
            where: {
              id: refreshPayload.userId,
            },
          });
          if (!record) {
            this.logger.error('User not found after refreshing token');
            throw new UnauthorizedException('Invalid token');
          }

          const newTokens = await this.jwtService.createTokens({
            email: refreshPayload.email,
            userId: refreshPayload.userId,
            type: refreshPayload.type,
          });
          setResponseCookies(response, newTokens);

          request[this.type] = record;
          return true;
        } catch (refreshError) {
          this.logger.error(`Failed to refresh token: ${refreshError.message}`);
          throw new UnauthorizedException('Invalid refresh token');
        }
      } else {
        this.logger.error(`Failed to authenticate: ${error.message}`);
        throw new UnauthorizedException('Invalid token');
      }
    }

    extractTokensFromCookies(request: Request): {
      accessToken: string;
      refreshToken: string;
    } {
      const accessToken = request.cookies.access_token as string;
      const refreshToken = request.cookies.refresh_token as string;
      if (!accessToken || !refreshToken) {
        this.logger.error('Access token or refresh token is missing');
        throw new UnauthorizedException('Invalid token');
      }

      return {
        accessToken,
        refreshToken,
      };
    }

    determineType(id: string) {
      if (id.startsWith('go_') || id.startsWith('li_')) id = id.slice(3);
      if (id.startsWith('ck')) return UserTypes.Company;
      if (id.startsWith('pk')) return UserTypes.User;

      throw new UnauthorizedException('Invalid token');
    }
  }

  return mixin(AuthGuardMixin);
}
