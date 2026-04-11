import { generateUniqueOtp } from '@/shared/utils/unique-id';
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class OTPService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async generateOtp(key: string): Promise<string> {
    const otp = generateUniqueOtp();
    await this.redisClient.set(key, otp, 'EX', 4 * 60);
    return otp;
  }

  async verifyOtp(key: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redisClient.get(key);
    if (storedOtp !== otp) return false;

    await this.redisClient.del(key);
    return true;
  }
}
