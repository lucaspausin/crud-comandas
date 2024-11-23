import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { PrismaService } from '../prisma/prisma.service';

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
        archivo: true,
      },
    });

    if (!commandFound) {
      throw new NotFoundException(`No fue encontrado la comanda numero ${id}.`);
    }
    return commandFound;
  }

  async findCsv(id: number) {
    const csvData = await this.prismaService.comandas.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        boletos_reservas: {
          select: {
            equipo: true,
            usuarios: {
              select: {
                nombre_usuario: true,
              },
            },
          },
        },
        tecnica_tecnica_comanda_idTocomandas: {
          select: {
            patente: true,
          },
        },
        carga_externa: true,
        precio_carga_externa: true,
        pagos_efectivo_transferencia: true,
        pagos_tarjeta_1: true,
        pagos_plan_tarjeta_1: true,
        pagos_tarjeta_2: true,
        pagos_plan_tarjeta_2: true,
        pagos_tarjeta_3: true,
        pagos_plan_tarjeta_3: true,
        pagos_tarjeta_4: true,
        pagos_plan_tarjeta_4: true,
        pagos_tarjeta_5: true,
        pagos_plan_tarjeta_5: true,
        pagos_dolares: true,
      },
    });

    if (!csvData) {
      throw new NotFoundException(`No fue encontrada la comanda número ${id}.`);
    }

    // Filtrar pagos que tengan algún valor válido
    const filteredPayments = {};
    const payments = [
      'pagos_efectivo_transferencia',
      'pagos_tarjeta_1',
      'pagos_plan_tarjeta_1',
      'pagos_tarjeta_2',
      'pagos_plan_tarjeta_2',
      'pagos_tarjeta_3',
      'pagos_plan_tarjeta_3',
      'pagos_tarjeta_4',
      'pagos_plan_tarjeta_4',
      'pagos_tarjeta_5',
      'pagos_plan_tarjeta_5',
      'pagos_dolares',
    ];

    payments.forEach((payment) => {
      // Filtrar valores nulos, indefinidos, vacíos o cero
      if (csvData[payment] && csvData[payment].trim() !== '') {
        filteredPayments[payment] = csvData[payment];
      }
    });

    // Desanidar los objetos y formatear el JSON de forma plana
    const formattedData = {
      id: csvData.id,
      equipo: csvData.boletos_reservas?.equipo ?? 'N/A', // Usar "N/A" si no hay equipo
      nombre_usuario:
        csvData.boletos_reservas?.usuarios?.nombre_usuario ?? 'N/A', // Usar "N/A" si no hay nombre_usuario
      dominio: csvData.tecnica_tecnica_comanda_idTocomandas?.patente ?? 'N/A', // Usar "N/A" si no hay dominio
      carga_externa: csvData.carga_externa ? 'Sí' : 'No', // Convertir booleano a "Sí" o "No"
      precio_carga_externa: csvData.precio_carga_externa ?? 'N/A', // Usar "N/A" si no hay precio
      ...filteredPayments, // Incluir solo los pagos con valor
    };

    // Retornamos el JSON de forma plana con los pagos filtrados
    return formattedData;
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

  async remove(id: number) {
    const [
      reservationDeleted,
      comandaDeleted,
      clientDeleted,
      calendarioDeleted,
    ] = await this.prismaService.$transaction(async (prisma) => {
      // Paso 1: Encontrar la reserva por su ID
      const comanda = await prisma.comandas.findUnique({
        where: { id },
      });

      if (!comanda) {
        throw new NotFoundException(
          `No fue encontrada la comanda. Número: ${id}`,
        );
      }

      // Paso 2: Buscar la reserva asociada a la comanda
      const reservation = await prisma.boletos_reservas.findUnique({
        where: { id: comanda.boleto_reserva_id }, // Buscar la reserva usando boleto_reserva_id
      });

      if (!reservation) {
        throw new NotFoundException(
          `No fue encontrada la reserva asociada a la comanda. Número de comanda: ${id}`,
        );
      }

      // Paso 3: Desvincular el tecnico_id en la comanda (si existe)
      if (comanda.tecnica_id) {
        await prisma.comandas.update({
          where: { id: comanda.id },
          data: {
            tecnica_id: null,
            estado: 'pendiente', // Se actualiza el campo para desvincular la técnica
          },
        });

        // Borrar el técnico vinculado a la comanda
        await prisma.tecnica.delete({
          where: { id: comanda.tecnica_id },
        });
      }

      // Paso 4: Borrar el evento del calendario vinculado a la reserva
      const calendarioDeleted = await prisma.calendario.deleteMany({
        where: {
          boleto_reserva_id: reservation.id, // Usamos el id de la reserva para buscar el calendario
        },
      });

      // Paso 5: Borrar la comanda
      const comandaDeleted = await prisma.comandas.delete({
        where: {
          id: comanda.id,
        },
      });

      // Paso 6: Borrar la reserva
      const reservationDeleted = await prisma.boletos_reservas.delete({
        where: {
          id: reservation.id,
        },
      });

      // Paso 7: Borrar el cliente vinculado a la reserva
      const clientDeleted = await prisma.clientes.delete({
        where: {
          id: reservation.cliente_id,
        },
      });

      return [
        reservationDeleted,
        comandaDeleted,
        clientDeleted,
        calendarioDeleted,
      ];
    });

    return {
      reservationDeleted,
      comandaDeleted,
      clientDeleted,
      calendarioDeleted,
    };
  }
}
