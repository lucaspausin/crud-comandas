import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarGateway } from './calendar.gateway';

@Injectable()
export class CalendarService {
  constructor(
    private prismaService: PrismaService,
    @Inject(forwardRef(() => CalendarGateway))
    private calendarGateway: CalendarGateway,
  ) {}

  private async emitCalendarUpdate() {
    const events = await this.findAll();
    this.calendarGateway.emitCalendarUpdate(events);
  }

  async create(createCalendarDto: CreateCalendarDto) {
    const { boleto_reserva_id, estado, titulo, fecha_inicio } =
      createCalendarDto;

    const newEvent = await this.prismaService.calendario.create({
      data: {
        boleto_reserva_id,
        estado: estado || 'pendiente',
        titulo,
        fecha_inicio,
      },
    });

    // Emitir actualización después de crear
    await this.emitCalendarUpdate();

    return newEvent;
  }

  async findAll() {
    return this.prismaService.calendario.findMany({
      include: {
        boletos_reservas: {
          include: {
            usuarios: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const eventFound = await this.prismaService.calendario.findUnique({
      where: {
        id: id,
      },
      include: {
        boletos_reservas: true,
      },
    });

    if (!eventFound) {
      throw new NotFoundException(`No fue encontrado el evento numero ${id}.`);
    }
    return eventFound;
  }

  async update(id: number, UpdateCalendarDto: UpdateCalendarDto) {
    const updateCalendar = await this.prismaService.calendario.update({
      where: {
        id: id,
      },
      data: {
        ...UpdateCalendarDto,
      },
    });

    if (!updateCalendar) {
      throw new NotFoundException(`No se encontró el evento con el ID: ${id}`);
    }

    // Emitir actualización después de modificar
    await this.emitCalendarUpdate();

    return updateCalendar;
  }

  async remove(id: number) {
    const eventToRemove = await this.prismaService.calendario.findUnique({
      where: {
        id: id,
      },
    });

    if (!eventToRemove) {
      throw new NotFoundException(`No se encontró el evento con el ID: ${id}`);
    }

    await this.prismaService.calendario.delete({
      where: {
        id: id,
      },
    });

    // Emitir actualización después de eliminar
    await this.emitCalendarUpdate();

    return { message: `Evento con ID: ${id} ha sido eliminado exitosamente.` };
  }
}
