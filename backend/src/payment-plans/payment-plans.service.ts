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
      select: {
        id: true,
        name: true,
        interest: true,
        installments: true,
        active: true,
        position: true,
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
      select: {
        id: true,
        name: true,
        interest: true,
        installments: true,
        active: true,
        position: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.payment_plans.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        interest: true,
        installments: true,
        active: true,
        position: true,
      },
    });
  }

  async update(id: number, updatePaymentPlanDto: UpdatePaymentPlanDto) {
    return this.prisma.payment_plans.update({
      where: { id },
      data: updatePaymentPlanDto,
      select: {
        id: true,
        name: true,
        interest: true,
        installments: true,
        active: true,
        position: true,
      },
    });
  }

  async updatePosition(id: number, newPosition: number) {
    const plan = await this.prisma.payment_plans.findUnique({
      where: { id },
      select: {
        id: true,
        position: true,
      },
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
      select: {
        id: true,
        name: true,
        interest: true,
        installments: true,
        active: true,
        position: true,
      },
    });
  }

  async remove(id: number) {
    try {
      // Primero intentamos obtener el plan sin campos temporales
      const planExists = await this.prisma.payment_plans.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!planExists) {
        throw new Error(`Payment plan with id ${id} not found`);
      }

      const result = await this.prisma.payment_plans.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          position: true,
        },
      });

      return {
        success: true,
        message: 'Plan deleted successfully',
        data: result,
      };
    } catch (error) {
      // Capturamos el error específico de Prisma
      console.error('Delete error details:', error);
      throw new Error(`Failed to delete payment plan: ${error.message}`);
    }
  }
}
