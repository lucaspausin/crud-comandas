import { Module } from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { PaymentPlansController } from './payment-plans.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaymentPlansController],
  providers: [PaymentPlansService, PrismaService],
})
export class PaymentPlansModule {} 