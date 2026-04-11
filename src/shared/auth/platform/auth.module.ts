import { Module } from '@nestjs/common';
import { PlatformAuthService } from './auth.service';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { JwtModule } from '@nestjs/jwt';
import { JWTService } from '../miscs/jwt';
import { OTPService } from '../miscs/otp';
import { BcryptService } from '../miscs/bcrypt';
import { PlatformAuthController } from './auth.controller';
import { EmailModule } from '@/shared/email/email.module';
import { OAuth2Client } from 'google-auth-library';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    EmailModule,
  ],
  controllers: [PlatformAuthController],
  providers: [
    PlatformAuthService,
    PostgresPrismaService,
    JWTService,
    OTPService,
    BcryptService,
    {
      provide: OAuth2Client,
      useValue: new OAuth2Client(process.env.GOOGLE_CLIENT_ID),
    },
  ],
})
export class PlatformAuthModule {}
