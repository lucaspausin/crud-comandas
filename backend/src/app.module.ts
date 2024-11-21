import { Module } from '@nestjs/common';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaService } from './prisma/prisma.service';
import { ClientsModule } from './clients/clients.module';
import { CommandsModule } from './commands/commands.module';
import { TechniquesModule } from './techniques/techniques.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { FilesModule } from './files/files.module';
@Module({
  imports: [ReservationsModule, ClientsModule, CommandsModule, TechniquesModule, UsersModule, AuthModule, CalendarModule, FilesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
