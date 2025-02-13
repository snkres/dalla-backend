import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { Constants } from '@/shared/constants';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          tls: { rejectUnauthorized: false },
        });
        return redis;
      },
    },
  ],
  exports: [Constants.REDIS_CLIENT],
})
export class RedisModule {}
