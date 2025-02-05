import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentPlanDto: CreatePaymentPlanDto) {
    return this.prisma.payment_plans.create({
      data: createPaymentPlanDto,
    });
  }

  async findAll() {
    return this.prisma.payment_plans.findMany({
      where: {
        active: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.payment_plans.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePaymentPlanDto: UpdatePaymentPlanDto) {
    return this.prisma.payment_plans.update({
      where: { id },
      data: updatePaymentPlanDto,
    });
  }

  async remove(id: number) {
    return this.prisma.payment_plans.delete({
      where: { id },
    });
  }
} 