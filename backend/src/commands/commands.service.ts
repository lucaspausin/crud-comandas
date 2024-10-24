import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommandsService {
  constructor(private prismaService: PrismaService) {}

  create(createCommandDto: CreateCommandDto) {
    return 'This action adds a new command';
  }

  async findAll() {
    return this.prismaService.comandas.findMany({
      include: {
        boletos_reservas: {
          include: {
            usuarios: true,
            clientes: true, // Incluye la información del usuario en cada boleto
          },
        },
        tecnica_tecnica_comanda_idTocomandas: {
          include: {
            usuarios: true,
          },
        },
      },
    });
  }

  async findSummary() {
    try {
      const totalOrders = await this.prismaService.comandas.count();

      const totalPending = await this.prismaService.comandas.count({
        where: {
          estado: 'pendiente',
        },
      });

      const totalCompleted = await this.prismaService.comandas.count({
        where: {
          estado: 'completado',
        },
      });

      const currentMonthOrders = await this.prismaService.comandas.count({
        where: {
          estado: 'completado',
          creado_en: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1,
            ),
          },
        },
      });

      const previousMonthOrders = await this.prismaService.comandas.count({
        where: {
          estado: 'completado',
          creado_en: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1,
            ),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });

      let percentageChange = '0.0%';
      if (previousMonthOrders === 0) {
        if (currentMonthOrders > 0) {
          percentageChange = '+100.0%';
        }
      } else {
        const change =
          ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
          100;
        percentageChange = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      }

      return {
        totalOrders,
        totalPending,
        totalCompleted,
        currentMonthOrders,
        previousMonthOrders,
        percentageChange,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(id: number) {
    const commandFound = await this.prismaService.comandas.findUnique({
      where: {
        id: id,
      },
      include: {
        boletos_reservas: true,
      },
    });

    if (!commandFound) {
      throw new NotFoundException(`No fue encontrado la comanda numero ${id}.`);
    }
    return commandFound;
  }

  update(id: number, updateCommandDto: UpdateCommandDto) {
    return `This action updates a #${id} command`;
  }

  remove(id: number) {
    return `This action removes a #${id} command`;
  }
}
