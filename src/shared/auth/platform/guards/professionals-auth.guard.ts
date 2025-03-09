import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PinoLogger } from 'nestjs-pino';
import { IS_PUBLIC_KEY } from '@/shared/decorators/isPublic.decorator';
import { JWTService } from '../../miscs/jwt';
import setResponseCookies from '../utils/set-response-cookies';

@Injectable()
export class ProfessionalAuthGuard implements CanActivate {
  private readonly logger = new PinoLogger({
    renameContext: ProfessionalAuthGuard.name,
  });

  constructor(
    private jwtService: JWTService,
    private reflector: Reflector,
    private prisma: PostgresPrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { accessToken, refreshToken } = this.extractTokensFromHeader(request);

    try {
      const payload = await this.jwtService.decodeAccessToken(accessToken);
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (user) {
        request['user'] = user;
        return true;
      } else {
        this.logger.error('User not found');
        throw new UnauthorizedException('User not found');
      }
    } catch (error) {
      return this.handleTokenErrors(
        error,
        refreshToken,
        accessToken,
        request,
        response,
      );
    }
  }

  private async handleTokenErrors(
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

        const newTokens = await this.jwtService.createTokens({
          email: refreshPayload.email,
          userId: refreshPayload.userId,
          type: refreshPayload.type,
        });

        setResponseCookies(response, newTokens);

        const user = await this.prisma.user.findUnique({
          where: {
            id: refreshPayload.userId,
          },
        });

        if (user) {
          request['user'] = user;
          return true;
        } else {
          this.logger.error('User not found after refreshing token');
          throw new UnauthorizedException('User not found');
        }
      } catch (refreshError) {
        this.logger.error(`Failed to refresh token: ${refreshError.message}`);
        throw new UnauthorizedException('Invalid refresh token');
      }
    } else {
      this.logger.error(`Failed to authenticate: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokensFromHeader(request: Request): {
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
}
