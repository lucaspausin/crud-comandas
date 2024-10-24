import { Module } from '@nestjs/common';
import { TechniquesService } from './techniques.service';
import { TechniquesController } from './techniques.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TechniquesController],
  providers: [TechniquesService, PrismaService],
})
export class TechniquesModule {}
