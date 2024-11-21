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
} from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post()
  create(@Body() createCommandDto: CreateCommandDto) {
    return this.commandsService.create(createCommandDto);
  }

  @Get()
  findAll() {
    return this.commandsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  async findSummary(@Request() req: any) {
    const userId = Number(req.user.userId); // Asegúrate de acceder correctamente
    const userRole = req.user.role; // Accede al rol

    return await this.commandsService.findSummary(userId, userRole);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandsService.findOne(+id);
  }

  @Get('csv/:id')
  async getCsvData(@Param('id') id: string) {
    return this.commandsService.findCsv(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommandDto: UpdateCommandDto) {
    return this.commandsService.update(+id, updateCommandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandsService.remove(+id);
  }
}
