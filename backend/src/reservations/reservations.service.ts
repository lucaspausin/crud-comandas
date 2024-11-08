import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prismaService: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    const {
      nombre_completo,
      dni,
      domicilio,
      localidad,
      telefono,
      modelo_patente,
      ...reservationData
    } = createReservationDto;

    try {
      // Usamos una transacción para garantizar que ambas operaciones se realicen correctamente
      const [cliente, reserva, comanda, eventoCalendario] =
        await this.prismaService.$transaction(async (prisma) => {
          // Verifica si el cliente ya existe
          let cliente = await prisma.clientes.findUnique({
            where: { dni }, // Suponiendo que el DNI es único para cada cliente
          });

          // Si el cliente no existe, crea uno nuevo
          if (!cliente) {
            cliente = await prisma.clientes.create({
              data: {
                nombre_completo,
                dni,
                domicilio,
                localidad,
                telefono,
              },
            });
          }

          const reservaExistente = await prisma.boletos_reservas.findFirst({
            where: {
              cliente_id: cliente.id,
              modelo_patente, // Chequea por `modelo_patente` para evitar duplicados
            },
          });

          if (reservaExistente) {
            throw {
              statusCode: 400,
              message: `Error : El cliente ${dni} ya tiene una reserva para ${modelo_patente}.`,
            };
          }

          // Crea la reserva y vincula el ID del cliente
          const reserva = await prisma.boletos_reservas.create({
            data: {
              ...reservationData,
              cliente_id: cliente.id, // Asegúrate de que 'cliente_id' es el campo correcto en tu tabla 'boletos_reservas'
              modelo_patente, // Incluye el `modelo_patente` en la creación de la reserva
            },
          });

          const usuario = await prisma.usuarios.findUnique({
            where: { id: reservationData.usuario_id },
            select: { nombre_usuario: true },
          });

          // Crea una nueva comanda vinculada a la reserva
          const comanda = await prisma.comandas.create({
            data: {
              boleto_reserva_id: reserva.id, // Vincula la comanda con la ID de la reserva
              estado: 'pendiente', // Establece el estado de la comanda como "pendiente"
            },
          });

          const eventoCalendario = await prisma.calendario.create({
            data: {
              boleto_reserva_id: reserva.id, // Vincula el evento con la ID de la reserva
              titulo: `${modelo_patente} - ${reservationData.equipo} - ${usuario?.nombre_usuario || 'Usuario Desconocido'}`, // Título del evento
              fecha_inicio: reservationData.fecha_instalacion, // Fecha de inicio del evento
              estado: 'pendiente', // Estado del evento
            },
          });

          return [cliente, reserva, comanda, eventoCalendario]; // Devuelve el cliente, la reserva y la comanda
        });

      return { cliente, reserva, comanda, eventoCalendario }; // Devuelve tanto la reserva como la comanda creada
    } catch (error) {
      if (error.statusCode && error.message) {
        // Si se trata de un error manejado, responde con el mensaje y el código de estado
        throw new HttpException(error.message, error.statusCode);
      }

      // Maneja errores conocidos de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(`El cliente con DNI ${dni} ya existe.`, 400);
        }
      }

      // Error genérico
      throw new HttpException(
        `Error al crear la reserva: ${error.message}`,
        500,
      );
    }
  }

  async findAll() {
    return this.prismaService.boletos_reservas.findMany({
      include: {
        clientes: true,
        usuarios: {
          // Incluye la relación 'usuarios' para obtener la información del usuario
          select: {
            id: true, // Incluye el ID del usuario
            nombre_usuario: true,
            roles: {
              select: {
                id: true,
                nombre: true,
              },
            }, // Incluye el nombre del usuario
          },
        }, // Incluye la relación 'clientes' para obtener la información del cliente
      },
    });
  }

  async findSummary(userId: number, userRole: number) {
    const totalReservations =
      userRole === 3
        ? await this.prismaService.boletos_reservas.count()
        : await this.prismaService.boletos_reservas.count({
            where: {
              usuario_id: userId, // Filtra correctamente por usuario_id
            },
          });

    // Obtener el total de reservas del mes actual
    const currentMonthCount =
      userRole === 3
        ? await this.prismaService.boletos_reservas.count({
            where: {
              fecha_instalacion: {
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
        : await this.prismaService.boletos_reservas.count({
            where: {
              usuario_id: userId, // Filtra correctamente por usuario_id
              fecha_instalacion: {
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

    // Obtener el total de reservas del mes anterior
    const previousMonthCount =
      userRole === 3
        ? await this.prismaService.boletos_reservas.count({
            where: {
              fecha_instalacion: {
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
        : await this.prismaService.boletos_reservas.count({
            where: {
              usuario_id: userId, // Filtra correctamente por usuario_id
              fecha_instalacion: {
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

    // Calcular el porcentaje de cambio
    let percentageChange = '0.0%';
    if (previousMonthCount === 0) {
      if (currentMonthCount > 0) {
        percentageChange = '+100.0%'; // Si el mes anterior es 0 y el actual es mayor que 0
      }
    } else {
      const change =
        ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      percentageChange = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`; // Formato +/- con un decimal
    }

    return {
      totalReservations,
      currentMonthCount,
      previousMonthCount,
      percentageChange,
    };
  }

  async findOne(id: number) {
    const reservationFound =
      await this.prismaService.boletos_reservas.findUnique({
        where: {
          id: id,
        },
        include: {
          clientes: true,
          usuarios: true,
        },
      });

    if (!reservationFound) {
      throw new NotFoundException(
        `No fue encontrada la reserva. Numero : ${id}`,
      );
    }
    return reservationFound;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const {
      nombre_completo,
      dni,
      domicilio,
      localidad,
      telefono,
      fecha_instalacion,
      modelo_patente,
      equipo,
      ...reservationData
    } = updateReservationDto;

    // Verifica que la reserva exista y obtiene los datos junto con el cliente y usuario relacionados
    const reservationWithClientAndUser =
      await this.prismaService.boletos_reservas.findUnique({
        where: { id },
        include: {
          clientes: true, // Incluye la información del cliente relacionado
          usuarios: true, // Incluye la información del usuario relacionado
        },
      });

    if (!reservationWithClientAndUser) {
      throw new NotFoundException(
        `No fue encontrada la reserva. Numero : ${id}`,
      );
    }

    // Extrae el nombre de usuario del objeto relacionado
    const { nombre_usuario } = reservationWithClientAndUser.usuarios;

    // Inicia una transacción para actualizar reserva, cliente y evento en el calendario
    const updatedReservation = await this.prismaService.$transaction(
      async (prisma) => {
        // Actualiza la reserva
        const reservation = await prisma.boletos_reservas.update({
          where: { id },
          data: {
            ...reservationData,
            fecha_instalacion,
            modelo_patente:
              modelo_patente ?? reservationWithClientAndUser.modelo_patente,
            equipo: equipo ?? reservationWithClientAndUser.equipo,
          },
        });

        // Si hay datos de cliente, actualiza al cliente también
        if (nombre_completo || dni || domicilio || localidad || telefono) {
          await prisma.clientes.update({
            where: { id: reservation.cliente_id },
            data: {
              nombre_completo,
              dni,
              domicilio,
              localidad,
              telefono,
            },
          });
        }

        // Construye el nuevo título para el evento del calendario
        const nuevoTitulo = `${modelo_patente || reservationWithClientAndUser.modelo_patente} - ${equipo || reservationWithClientAndUser.equipo} - ${nombre_usuario}`;

        // Actualiza el evento del calendario asociado a la reserva si cambian `fecha_instalacion`, `modelo_patente` o `equipo`
        await prisma.calendario.updateMany({
          where: { boleto_reserva_id: id },
          data: {
            fecha_inicio:
              fecha_instalacion ||
              reservationWithClientAndUser.fecha_instalacion,
            titulo: nuevoTitulo,
          },
        });

        // Retorna la reserva actualizada
        return reservation;
      },
    );

    return updatedReservation;
  }

  async remove(id: number) {
    const [reservationDeleted, comandaDeleted, clientDeleted] =
      await this.prismaService.$transaction(async (prisma) => {
        // Paso 1: Encontrar la reserva por su ID
        const reservation = await prisma.boletos_reservas.findUnique({
          where: { id },
        });

        if (!reservation) {
          throw new NotFoundException(
            `No fue encontrada la reserva. Número: ${id}`,
          );
        }

        // Paso 2: Obtener la comanda vinculada a la reserva
        const comanda = await prisma.comandas.findFirst({
          where: { boleto_reserva_id: id },
        });

        // Paso 3: Desvincular el tecnico_id en la comanda (si existe)
        if (comanda && comanda.tecnica_id) {
          await prisma.comandas.update({
            where: { id: comanda.id },
            data: {
              tecnica_id: null,
              estado: 'pendiente', // Se actualiza el campo para desvincular la técnica
            },
          });

          // Paso 4: Borrar el técnico vinculado a la comanda
          await prisma.tecnica.delete({
            where: { id: comanda.tecnica_id },
          });
        }

        // Paso 5: Borrar la comanda
        const comandaDeleted = await prisma.comandas.deleteMany({
          where: {
            boleto_reserva_id: id,
          },
        });

        // Paso 6: Borrar la reserva
        const reservationDeleted = await prisma.boletos_reservas.delete({
          where: {
            id: id,
          },
        });

        // Paso 7: Borrar el cliente vinculado a la reserva
        const clientDeleted = await prisma.clientes.delete({
          where: {
            id: reservation.cliente_id,
          },
        });

        return [reservationDeleted, comandaDeleted, clientDeleted];
      });

    return { reservationDeleted, comandaDeleted, clientDeleted };
  }
}
