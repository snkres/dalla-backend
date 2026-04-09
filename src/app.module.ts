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
import { ProjectModule } from './projects/projects.module';
import DigitalOceanConfig from './shared/config/object-storage.config';
import { ObjectStorageModule } from './shared/upload/object-storage.module';
import { ProposalsModule } from './proposals/proposals.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ConversationModule } from './conversation/conversation.module';
import { ProjectFeedbackModule } from './project-feedback/project-feedback.module';

const isRedisTlsEnabled = () => {
  const redisTls = process.env.REDIS_TLS?.toLowerCase();
  return redisTls === 'true' || redisTls === '1' || redisTls === 'yes';
};

const getRedisConfig = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT || 10000),
  tls: isRedisTlsEnabled() ? { rejectUnauthorized: false } : undefined,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DigitalOceanConfig],
    }),
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
      redis: getRedisConfig(),
    }),
    PlatformAuthModule,
    RedisModule,
    ObjectStorageModule,
    ProfessionalModule,
    ProjectModule,
    CompanyModule,
    NotificationModule,
    MessageModule,
    WebsocketModule,
    ConversationModule,
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
    ProposalsModule,
    ProjectFeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService, PostgresPrismaService],
})
export class AppModule {}
