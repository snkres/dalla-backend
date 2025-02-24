import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bull';
import { PostgresPrismaService } from './config/prisma/postgres.services';
import { ProfessionalModule } from './professionals/professional.module';
import { RouterModule } from '@nestjs/core';
import { CompanyModule } from './companies/company.module';
import { ConfigModule } from '@nestjs/config';
import { PlatformAuthModule } from './shared/auth/platform/auth.module';
import { RedisModule } from './shared/auth/miscs/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        tls: { rejectUnauthorized: false },
      },
    }),
    PlatformAuthModule,
    RedisModule,
    ProfessionalModule, // there is a bug here , auth guards result in returning 403 for all routes
    CompanyModule,
    RouterModule.register([
      {
        path: 'professionals',
        module: ProfessionalModule,
      },
      {
        path: 'company',
        module: CompanyModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, PostgresPrismaService],
})
export class AppModule {}
