import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { Constants } from '@/shared/constants';

const isRedisTlsEnabled = () => {
  const redisTls = process.env.REDIS_TLS?.toLowerCase();
  return redisTls === 'true' || redisTls === '1' || redisTls === 'yes';
};

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT || 6379),
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT || 10000),
          tls: isRedisTlsEnabled() ? { rejectUnauthorized: false } : undefined,
        });
        return redis;
      },
    },
  ],
  exports: [Constants.REDIS_CLIENT],
})
export class RedisModule {}
