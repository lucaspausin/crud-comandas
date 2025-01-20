import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarGateway } from './calendar.gateway';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, PrismaService, CalendarGateway],
  exports: [CalendarService, CalendarGateway],
})
export class CalendarModule {}
