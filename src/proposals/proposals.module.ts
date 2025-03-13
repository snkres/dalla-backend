import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';

@Module({
  providers: [ProposalsService, PostgresPrismaService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
