import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async create(@Body() createSupportDto: CreateSupportDto) {
    try {
      return await this.supportService.create(createSupportDto);
    } catch (error) {
      throw new BadRequestException(
        'Error creating cylinder: ' + error.message,
      );
    }
  }

  @Get()
  async findAll() {
    return await this.supportService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const support = await this.supportService.findOne(id);
    if (!support) {
      throw new NotFoundException(`Cylinder with ID ${id} not found`);
    }
    return support;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupportDto: UpdateSupportDto,
  ) {
    try {
      return await this.supportService.update(id, updateSupportDto);
    } catch (error) {
      throw new BadRequestException(
        'Error updating cylinder: ' + error.message,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.supportService.remove(id);
      return { message: 'Cylinder deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        'Error deleting cylinder: ' + error.message,
      );
    }
  }
}
