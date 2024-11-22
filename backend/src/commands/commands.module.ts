import { Module } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CommandsController } from './commands.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CommandsController],
  providers: [CommandsService, PrismaService],
})
export class CommandsModule {}
