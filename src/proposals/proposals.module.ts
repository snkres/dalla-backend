import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  providers: [ProposalsService, PostgresPrismaService],
  imports: [NotificationModule],
  exports: [ProposalsService],
})
export class ProposalsModule {}
