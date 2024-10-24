import { Module } from '@nestjs/common';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaService } from './prisma/prisma.service';
import { ClientsModule } from './clients/clients.module';
import { CommandsModule } from './commands/commands.module';
import { TechniquesModule } from './techniques/techniques.module';
@Module({
  imports: [ReservationsModule, ClientsModule, CommandsModule, TechniquesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
