import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@repo/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('database.url'),
    });
    super({ adapter });
  }

  onModuleInit() {
    this.logger.log('Connecting to the database', 'PrismaService');
    this.$connect();
  }

  onModuleDestroy() {
    this.logger.log('Disconnecting from the database', 'PrismaService');
    this.$disconnect();
  }
}
