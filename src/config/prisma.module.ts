import { Module, Global } from '@nestjs/common';
import { PostgresPrismaService } from './prisma/postgres.services';

@Global()
@Module({
  providers: [PostgresPrismaService],
  exports: [PostgresPrismaService],
})
export class PrismaModule {}
