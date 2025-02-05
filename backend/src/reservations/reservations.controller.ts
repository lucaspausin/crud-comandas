import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Delete,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  async findSummary(@Request() req: any) {
    const userId = Number(req.user.userId); // Asegúrate de acceder correctamente
    const userRole = req.user.role; // Accede al rol

    return await this.reservationsService.findSummary(userId, userRole);
  }

  @Get('dashboard-stats')
  @UseGuards(AuthGuard('jwt'))
  async getDashboardStats(
    @Request() req,
    @Query('userId') userId: string,
    @Query('role') role: string,
  ) {
    const user = {
      userId: parseInt(userId),
      role: parseInt(role),
    };
    return this.reservationsService.getDashboardStats(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(+id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(+id);
  }
}
