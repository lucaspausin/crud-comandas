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

  async findSummary(userId: number, userRole: number) {
    try {
      const totalOrders =
        userRole === 3
          ? await this.prismaService.comandas.count() // Todos los registros si es admin
          : await this.prismaService.comandas.count({
              where: {
                boletos_reservas: {
                  usuario_id: userId, // Filtrar por usuario_id de la boleta
                },
              },
            });

      const totalPending =
        userRole === 3
          ? await this.prismaService.comandas.count({
              where: { estado: 'pendiente' },
            })
          : await this.prismaService.comandas.count({
              where: {
                estado: 'pendiente',
                boletos_reservas: {
                  usuario_id: userId,
                },
              },
            });

      const totalCompleted =
        userRole === 3
          ? await this.prismaService.comandas.count({
              where: { estado: 'completado' },
            })
          : await this.prismaService.comandas.count({
              where: {
                estado: 'completado',
                boletos_reservas: {
                  usuario_id: userId,
                },
              },
            });

      const currentMonthOrders =
        userRole === 3
          ? await this.prismaService.comandas.count({
              where: {
                estado: 'completado',
                creado_en: {
                  gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1,
                  ),
                  lt: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1,
                  ),
                },
              },
            })
          : await this.prismaService.comandas.count({
              where: {
                estado: 'completado',
                boletos_reservas: {
                  usuario_id: userId,
                },
                creado_en: {
                  gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1,
                  ),
                  lt: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1,
                  ),
                },
              },
            });

      const previousMonthOrders =
        userRole === 3
          ? await this.prismaService.comandas.count({
              where: {
                estado: 'completado',
                creado_en: {
                  gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - 1,
                    1,
                  ),
                  lt: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1,
                  ),
                },
              },
            })
          : await this.prismaService.comandas.count({
              where: {
                estado: 'completado',
                boletos_reservas: {
                  usuario_id: userId,
                },
                creado_en: {
                  gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - 1,
                    1,
                  ),
                  lt: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1,
                  ),
                },
              },
            });

      let percentageChange = '0.0%';
      if (previousMonthOrders === 0) {
        if (currentMonthOrders > 0) {
          percentageChange = '+100.0%'; // Si el mes anterior es 0 y el actual es mayor que 0
        }
      } else {
        const change =
          ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
          100;
        percentageChange = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`; // Formato +/- con un decimal
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

    if (!commandFound) {
      throw new NotFoundException(`No fue encontrado la comanda numero ${id}.`);
    }
    return commandFound;
  }

  async update(id: number, updateCommandDto: UpdateCommandDto) {
   const updateCommand = await this.prismaService.comandas.update({
     where: {
       id: id, // Busca la técnica por ID
     },
     data: {
       ...updateCommandDto, // Actualiza solo los campos que están en el DTO
     },
   });

   if (!updateCommandDto) {
     throw new NotFoundException(`No se encontró la técnica con el ID: ${id}`);
   }

   return updateCommand;
  }

  remove(id: number) {
    return `This action removes a #${id} command`;
  }
}
