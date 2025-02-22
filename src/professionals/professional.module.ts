import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { PlatformAuthModule } from '@/shared/auth/platform/auth.module';
import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professional.controller';
import { ProfessionalsService } from './professional.service';

@Module({
  imports: [PlatformAuthModule],
  providers: [PostgresPrismaService, ProfessionalsService],
  controllers: [ProfessionalsController],
})
export class ProfessionalModule {}
