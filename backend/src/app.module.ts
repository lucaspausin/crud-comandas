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
import { BrandsModule } from './brands/brands.module';
import { SupportModule } from './support/support.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { VehiclesImagesModule } from './vehicles_images/vehicles_images.module';
import { SupportImagesModule } from './support_images/support_images.module';
import { PaymentPlansModule } from './payment-plans/payment-plans.module';
@Module({
  imports: [ReservationsModule, ClientsModule, CommandsModule, TechniquesModule, UsersModule, AuthModule, CalendarModule, FilesModule, BrandsModule, SupportModule, VehiclesModule, VehiclesImagesModule, SupportImagesModule, PaymentPlansModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
