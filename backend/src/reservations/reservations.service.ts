import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CalendarGateway } from '../calendar/calendar.gateway';

@Injectable()
export class ReservationsService {
  constructor(
    private prismaService: PrismaService,
    private calendarGateway: CalendarGateway,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const {
      nombre_completo,
      dni,
      domicilio,
      localidad,
      telefono,
      patente_vehiculo,
      sena,
      precio,
      monto_final_abonar,
      precio_carga_externa,
      ...reservationData
    } = createReservationDto;

    // Convertir todos los valores numéricos a números, asegurando que sean válidos
    const senaValue = sena
      ? parseFloat(String(sena).replace(/[^\d.-]/g, ''))
      : 0;
    const precioValue = precio ? Number(precio) : 0;
    const montoFinalValue = monto_final_abonar ? Number(monto_final_abonar) : 0;
    const precioCargaExternaValue = precio_carga_externa
      ? Number(precio_carga_externa)
      : 0;

    try {
      // Usamos una transacción para garantizar que ambas operaciones se realicen correctamente
      const [cliente, reserva, comanda, eventoCalendario, tecnica] =
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
              patente_vehiculo, // Chequea por `modelo_patente` para evitar duplicados
            },
          });

          if (reservaExistente) {
            throw {
              statusCode: 400,
              message: `Error : El cliente ${dni} ya tiene una reserva para ${patente_vehiculo}.`,
            };
          }

          // Crea la reserva y vincula el ID del cliente
          const reserva = await prisma.boletos_reservas.create({
            data: {
              ...reservationData,
              cliente_id: cliente.id,
              patente_vehiculo,
              sena: senaValue,
              precio: precioValue,
              monto_final_abonar: montoFinalValue,
              precio_carga_externa: String(precioCargaExternaValue),
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

          // **Nuevo: Crear una técnica vinculada a la comanda dentro de la transacción**
          const tecnica = await prisma.tecnica.create({
            data: {
              comanda_id: comanda.id, // Asigna la ID de la comanda
              // Puedes agregar otros campos necesarios para la técnica aquí
            },
          });

          const eventoCalendario = await prisma.calendario.create({
            data: {
              boleto_reserva_id: reserva.id,
              titulo: `${reserva.marca_vehiculo} ${reserva.modelo_vehiculo} ${
                reserva.patente_vehiculo
              } - ${reservationData.equipo} - ${
                usuario?.nombre_usuario || 'Usuario Desconocido'
              }`,
              fecha_inicio: reservationData.fecha_instalacion,
              estado: senaValue !== 0 ? 'senado' : 'pendiente',
            },
            include: {
              boletos_reservas: {
                include: {
                  usuarios: true,
                },
              },
            },
          });

          // Emitir solo el nuevo evento
          await this.calendarGateway.emitCalendarUpdate(
            eventoCalendario,
            'single',
          );

          return [cliente, reserva, comanda, eventoCalendario, tecnica];
        });

      return { cliente, reserva, comanda, eventoCalendario, tecnica }; // Devuelve tanto la reserva como la comanda y la técnica creada
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
          select: {
            id: true,
            nombre_usuario: true,
            roles: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        comandas: true,
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
          usuarios: {
            select: {
              id: true,
              nombre_usuario: true,
              roles: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
          comandas: true,
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
      marca_vehiculo, // Asegúrate de agregar la marca
      modelo_vehiculo,
      patente_vehiculo,
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
            patente_vehiculo:
              patente_vehiculo ?? reservationWithClientAndUser.patente_vehiculo,
            equipo: equipo ?? reservationWithClientAndUser.equipo,
            marca_vehiculo:
              marca_vehiculo ?? reservationWithClientAndUser.marca_vehiculo,
            modelo_vehiculo:
              modelo_vehiculo ?? reservationWithClientAndUser.modelo_vehiculo,
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
        const nuevoTitulo = `${reservation.marca_vehiculo} ${
          reservation.modelo_vehiculo
        } ${reservation.patente_vehiculo} - ${
          equipo || reservationWithClientAndUser.equipo
        } - ${nombre_usuario}`;

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
    const [reservationDeleted, calendarioDeleted] =
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

        // Paso 3: Borrar el evento del calendario vinculado a la reserva
        const calendarioDeleted = await prisma.calendario.deleteMany({
          where: {
            boleto_reserva_id: id, // Eliminamos el evento del calendario asociado a la reserva
          },
        });

        // Paso 4: Borrar la reserva (boleto)
        const reservationDeleted = await prisma.boletos_reservas.delete({
          where: {
            id: id,
          },
        });

        // Retornar los resultados
        return [reservationDeleted, calendarioDeleted];
      });

    return {
      reservationDeleted,
      calendarioDeleted,
    };
  }

  async getDashboardStats(user: any) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Primero obtenemos el total de ventas según el rol
    const totalQuery = this.prismaService.boletos_reservas.findMany({
      where: {
        ...(user.role === 1 ? { usuario_id: user.userId } : {}),
      },
    });

    // Luego obtenemos las ventas del mes actual con los estados específicos
    const currentMonthQuery = this.prismaService.calendario.findMany({
      where: {
        estado: {
          in: ['senado', 'confirmado', 'completado'],
        },
        fecha_inicio: {
          gte: firstDayOfMonth,
          lte: today,
        },
        boletos_reservas: {
          ...(user.role === 1 ? { usuario_id: user.userId } : {}),
        },
      },
      include: {
        boletos_reservas: true,
      },
    });

    const [reservations, currentMonthReservations] = await Promise.all([
      totalQuery,
      currentMonthQuery,
    ]);

    return {
      totalSales: reservations.length,
      currentMonthSales: currentMonthReservations.length,
    };
  }
}
