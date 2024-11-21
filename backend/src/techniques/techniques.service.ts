import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TechniquesService {
  constructor(private prismaService: PrismaService) {}

  async create(createTechniqueDto: CreateTechniqueDto) {
    const { comanda_id, ...techniqueData } = createTechniqueDto;

    // Verifica si la comanda existe
    const comanda = await this.prismaService.comandas.findUnique({
      where: { id: comanda_id },
    });

    if (!comanda) {
      throw new NotFoundException(
        `No se encontró la comanda con el ID: ${comanda_id}`,
      );
    }

    // Crea la técnica vinculada a la comanda
    const tecnica = await this.prismaService.tecnica.create({
      data: {
        ...techniqueData, // Usamos todos los datos del DTO
        comanda_id, // Vinculamos la técnica con la comanda correspondiente
      },
    });

    // Después de crear la técnica, actualiza el estado de la comanda a "en_proceso"
    const updatedComanda = await this.prismaService.comandas.update({
      where: { id: comanda_id },
      data: {
        estado: 'en_proceso',
        tecnica_id: tecnica.id,
      },
    });

    return {
      message:
        'Técnica creada y comanda actualizada a "en_proceso" exitosamente.',
      tecnica,
      comanda: updatedComanda, // Devuelve la comanda con el estado actualizado
    };
  }

  async findAll() {
    return this.prismaService.tecnica.findMany({
      include: {
        comandas_tecnica_comanda_idTocomandas: {
          include: {
            boletos_reservas: {
              include: {
                usuarios: true,
                clientes: true, // Incluye la información del usuario en cada boleto
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const techniqueFound = await this.prismaService.tecnica.findUnique({
      where: {
        id: id,
      },
      include: {
        comandas_tecnica_comanda_idTocomandas: {
          include: {
            boletos_reservas: {
              include: {
                usuarios: true,
                clientes: true, // Incluye la información del usuario en cada boleto
              },
            },
          },
        },
      },
    });

    if (!techniqueFound) {
      throw new NotFoundException(`No se encontró la técnica con el ID: ${id}`);
    }
    return techniqueFound;
  }

  async update(id: number, updateTechniqueDto: UpdateTechniqueDto) {
    const updatedTechnique = await this.prismaService.tecnica.update({
      where: {
        id: id, // Busca la técnica por ID
      },
      data: {
        ...updateTechniqueDto, // Actualiza solo los campos que están en el DTO
      },
    });

    if (!updatedTechnique) {
      throw new NotFoundException(`No se encontró la técnica con el ID: ${id}`);
    }

    return updatedTechnique;
  }

  async remove(id: number) {
    // Verifica si la técnica existe
    const tecnica = await this.prismaService.tecnica.findUnique({
      where: { id },
    });

    if (!tecnica) {
      throw new NotFoundException(`No se encontró la técnica con el ID: ${id}`);
    }

    // 1. Actualiza la comanda asociada para que tecnica_id sea null
    await this.prismaService.comandas.updateMany({
      where: {
        tecnica_id: id, // Comandas que tienen este id de técnica
      },
      data: {
        tecnica_id: null,
        estado: 'pendiente', // Se actualiza el campo para desvincular la técnica
      },
    });

    // 2. Borra la técnica, ya que no está referenciada por ninguna comanda
    await this.prismaService.tecnica.delete({
      where: { id },
    });

    return {
      message: `La técnica con ID: ${id} fue eliminada exitosamente.`,
      tecnica,
    };
  }
}
