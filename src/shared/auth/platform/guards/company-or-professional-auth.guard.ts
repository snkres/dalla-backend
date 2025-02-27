import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PinoLogger } from 'nestjs-pino';
import { IS_PUBLIC_KEY } from '@/shared/decorators/isPublic.decorator';

@Injectable()
export class CompanyOrProfessionalAuthGuard implements CanActivate {
  private readonly logger = new PinoLogger({
    renameContext: CompanyOrProfessionalAuthGuard.name,
  });

  constructor(
    private jwtService: JwtService,
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
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Try Company Auth
    const company = await this.authenticate(token, request, 'company');
    if (company) {
      return true;
    }

    // Try Professional Auth
    const user = await this.authenticate(token, request, 'user');
    if (user) {
      return true;
    }

    throw new UnauthorizedException('Invalid token');
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }

  private async authenticate(
    token: string,
    request: Request,
    model: 'company' | 'user',
  ) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const record = await this.prisma[model as string].findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (record) {
        request[model] = record;
        return true;
      }
    } catch (error) {
      this.logger.error(`Auth failed: ${error.message}`);
    }
    return false;
  }
}
