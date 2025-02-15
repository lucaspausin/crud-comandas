import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentPlanDto: CreatePaymentPlanDto) {
    // Obtener la última posición
    const lastPlan = await this.prisma.payment_plans.findFirst({
      orderBy: { position: 'desc' },
    });
    const nextPosition = lastPlan ? lastPlan.position + 1 : 0;

    return this.prisma.payment_plans.create({
      data: {
        ...createPaymentPlanDto,
        position: nextPosition,
      },
    });
  }

  async findAll() {
    return this.prisma.payment_plans.findMany({
      where: {
        active: true,
      },
      orderBy: {
        position: 'asc',
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

  async updatePosition(id: number, newPosition: number) {
    const plan = await this.prisma.payment_plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Actualizar las posiciones de los otros planes
    if (newPosition > plan.position) {
      await this.prisma.payment_plans.updateMany({
        where: {
          position: {
            gt: plan.position,
            lte: newPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    } else {
      await this.prisma.payment_plans.updateMany({
        where: {
          position: {
            gte: newPosition,
            lt: plan.position,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    }

    // Actualizar la posición del plan actual
    return this.prisma.payment_plans.update({
      where: { id },
      data: {
        position: newPosition,
      },
    });
  }

  async remove(id: number) {
    const plan = await this.prisma.payment_plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Actualizar las posiciones de los planes que están después del eliminado
    await this.prisma.payment_plans.updateMany({
      where: {
        position: {
          gt: plan.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return this.prisma.payment_plans.delete({
      where: { id },
    });
  }
}
