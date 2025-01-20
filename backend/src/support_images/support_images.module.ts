import { Module } from '@nestjs/common';
import { SupportImagesService } from './support_images.service';
import { SupportImagesController } from './support_images.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SupportImagesController],
  providers: [SupportImagesService, PrismaService],
})
export class SupportImagesModule {}
