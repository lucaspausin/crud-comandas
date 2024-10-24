import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
      ...reservationData
    } = createReservationDto;

    try {
      // Usamos una transacción para garantizar que ambas operaciones se realicen correctamente
      const [cliente, reserva, comanda] = await this.prismaService.$transaction(
        async (prisma) => {
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

          // Crea la reserva y vincula el ID del cliente
          const reserva = await prisma.boletos_reservas.create({
            data: {
              ...reservationData,
              cliente_id: cliente.id, // Asegúrate de que 'cliente_id' es el campo correcto en tu tabla 'boletos_reservas'
            },
          });

          // Crea una nueva comanda vinculada a la reserva
          const comanda = await prisma.comandas.create({
            data: {
              boleto_reserva_id: reserva.id, // Vincula la comanda con la ID de la reserva
              estado: 'pendiente', // Establece el estado de la comanda como "pendiente"
            },
          });

          return [cliente, reserva, comanda]; // Devuelve el cliente, la reserva y la comanda
        },
      );

      return { cliente, reserva, comanda }; // Devuelve tanto la reserva como la comanda creada
    } catch (error) {
      throw new Error(`No se pudo crear la reserva y la comanda. ${error}`); // Lanza un error para manejarlo en la capa superior
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

  async findSummary() {
    const totalReservations = await this.prismaService.boletos_reservas.count();

    // Obtener el total de reservas del mes actual
    const currentMonthCount = await this.prismaService.boletos_reservas.count({
      where: {
        fecha_instalacion: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Desde el inicio del mes actual
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Hasta el inicio del siguiente mes
        },
      },
    });

    // Obtener el total de reservas del mes anterior
    const previousMonthCount = await this.prismaService.boletos_reservas.count({
      where: {
        fecha_instalacion: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), // Desde el inicio del mes anterior
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Hasta el inicio del mes actual
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
      ...reservationData
    } = updateReservationDto;

    // Inicia una transacción para actualizar reserva y cliente
    const updatedReservation = await this.prismaService.$transaction(
      async (prisma) => {
        // Actualiza la reserva
        const reservation = await this.prismaService.boletos_reservas.update({
          where: { id },
          data: reservationData,
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

        // Retorna la reserva para continuar
        return reservation;
      },
    );

    // Después de la transacción, recupera la reserva con los datos del cliente
    const reservationWithClient =
      await this.prismaService.boletos_reservas.findUnique({
        where: { id },
        include: {
          clientes: true, // Incluye la información del cliente relacionado
        },
      });

    if (!reservationWithClient) {
      throw new NotFoundException(
        `No fue encontrada la reserva. Numero : ${id}`,
      );
    }

    return reservationWithClient;
  }

  async remove(id: number) {
    const [reservationDeleted, comandaDeleted] =
      await this.prismaService.$transaction(async (prisma) => {
        const reservation = await prisma.boletos_reservas.findUnique({
          where: { id: id },
        });

        if (!reservation) {
          throw new NotFoundException(
            `No fue encontrada la reserva. Numero : ${id}`,
          );
        }

        const comandaDeleted = await prisma.comandas.deleteMany({
          where: {
            boleto_reserva_id: id,
          },
        });

        const reservationDeleted = await prisma.boletos_reservas.delete({
          where: {
            id: id,
          },
        });

        return [reservationDeleted, comandaDeleted];
      });

    return { reservationDeleted, comandaDeleted };
  }
}
