import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@/prisma/postgres';
import { pagination } from 'prisma-extension-pagination';

@Injectable()
export class PostgresPrismaService
  extends PrismaClient
  implements OnModuleInit
{
  constructor() {
    super({
      log: ['query', 'info'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  pagination() {
    return this.$extends(
      pagination({
        pages: {
          includePageCount: true,
          includeTotalCount: true,
          defaultPageSize: 10,
          defaultPage: 1,
        },
        cursor: {
          getCursor: (page) => {
            return page.cursor;
          },
          setCursor: (page, cursor) => {
            return {
              ...page,
              cursor,
            };
          },
        },
        defaultPage: 1,
      }),
    );
  }
}
