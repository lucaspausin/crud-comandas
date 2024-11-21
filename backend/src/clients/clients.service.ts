import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prismaService: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const { nombre_completo, dni, domicilio, localidad, telefono } =
      createClientDto;

    try {
      // Usamos una transacción para garantizar la consistencia
      const cliente = await this.prismaService.$transaction(async (prisma) => {
        // Verifica si el cliente ya existe con el DNI proporcionado
        let clienteExistente = await prisma.clientes.findUnique({
          where: { dni }, // El DNI es único para cada cliente
        });

        // Si el cliente no existe, creamos uno nuevo
        if (!clienteExistente) {
          clienteExistente = await prisma.clientes.create({
            data: {
              nombre_completo,
              dni,
              domicilio,
              localidad,
              telefono,
            },
          });
        }

        return clienteExistente; // Retorna el cliente existente o el nuevo creado
      });

      // Devuelve el cliente creado o encontrado
      return cliente;
    } catch (error) {
      throw new Error(`No se pudo crear el cliente. ${error.message}`); // Maneja el error correctamente
    }
  }

  async findAll() {
    return this.prismaService.clientes.findMany({
      include: {
        boletos_reservas: true,
      },
    });
  }

  async findOne(id: number) {
    const clientFound = await this.prismaService.clientes.findUnique({
      where: {
        id: id,
      },
      include: {
        boletos_reservas: true,
      },
    });

    if (!clientFound) {
      throw new NotFoundException(`No fue encontrado el cliente numero ${id}.`);
    }
    return clientFound;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const { nombre_completo, dni, domicilio, localidad, telefono } =
      updateClientDto;

    const updatedClient = await this.prismaService.$transaction(
      async (prisma) => {
        // Actualiza el cliente
        const client = await this.prismaService.clientes.update({
          where: { id },
          data: {
            nombre_completo,
            dni,
            domicilio,
            localidad,
            telefono,
          },
        });

        return client;
      },
    );

    return updatedClient;
  }

  async remove(id: number) {
    try {
      const result = await this.prismaService.$transaction(async (prisma) => {
        // 1. Buscar el cliente con sus boletas de reserva vinculadas
        const cliente = await prisma.clientes.findUnique({
          where: { id },
          include: {
            boletos_reservas: {
              include: { comandas: true }, // Incluye también las comandas vinculadas a las boletas
            },
          },
        });

        // Si el cliente no existe, lanza una excepción
        if (!cliente) {
          throw new NotFoundException(
            `No se encontró el cliente con el ID: ${id}`,
          );
        }

        // 2. Obtener los IDs de las comandas vinculadas a las boletas del cliente
        const comandasIds = cliente.boletos_reservas
          .flatMap((boleto) => boleto.comandas)
          .map((comanda) => comanda.id);

        // 3. Si hay comandas, actualizar el tecnica_id a null y cambiar el estado a "pendiente"
        if (comandasIds.length > 0) {
          await prisma.comandas.updateMany({
            where: {
              id: { in: comandasIds },
            },
            data: {
              tecnica_id: null,
              estado: 'pendiente',
            },
          });
        }

        // 4. Obtener los IDs de las técnicas vinculadas a las comandas
        const tecnicasIds = cliente.boletos_reservas
          .flatMap((boleto) => boleto.comandas)
          .map((comanda) => comanda.tecnica_id)
          .filter((id) => id !== null); // Asegurarse de que no haya IDs nulos

        // 5. Eliminar las técnicas si existen
        if (tecnicasIds.length > 0) {
          await prisma.tecnica.deleteMany({
            where: {
              id: { in: tecnicasIds },
            },
          });
        }

        // 6. Eliminar las comandas vinculadas a las boletas del cliente
        if (comandasIds.length > 0) {
          await prisma.comandas.deleteMany({
            where: {
              id: { in: comandasIds },
            },
          });
        }

        // 7. Eliminar las boletas de reserva del cliente
        const boletosIds = cliente.boletos_reservas.map((boleto) => boleto.id);
        if (boletosIds.length > 0) {
          await prisma.boletos_reservas.deleteMany({
            where: { id: { in: boletosIds } },
          });
        }

        // 8. Finalmente, eliminar el cliente
        const clienteEliminado = await prisma.clientes.delete({
          where: { id },
        });

        return {
          clienteEliminado,
          boletosEliminados: cliente.boletos_reservas, // Boletas que se eliminaron
        };
      });

      // Construye el mensaje de éxito junto con los detalles del cliente y sus boletas/comandas
      return {
        message: `El cliente con ID ${id} y todos sus datos relacionados fueron eliminados exitosamente.`,
        cliente: result.clienteEliminado,
        boletosEliminados: result.boletosEliminados.map((boleto) => ({
          id: boleto.id,
          patente_vehiculo: boleto.patente_vehiculo,
          equipo: boleto.equipo,
          precio: boleto.precio,
          fecha_instalacion: boleto.fecha_instalacion,
          comandasEliminadas: boleto.comandas,
        })),
      };
    } catch (error) {
      // Manejo de errores
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `No se pudo eliminar el cliente con ID ${id}. ${error.message}`,
      );
    }
  }
}
