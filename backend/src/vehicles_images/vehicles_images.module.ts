import { Module } from '@nestjs/common';
import { VehiclesImagesService } from './vehicles_images.service';
import { VehiclesImagesController } from './vehicles_images.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VehiclesImagesController],
  providers: [VehiclesImagesService, PrismaService],
})
export class VehiclesImagesModule {}
