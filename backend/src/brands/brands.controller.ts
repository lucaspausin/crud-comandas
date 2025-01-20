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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    try {
      return await this.brandsService.create(createBrandDto);
    } catch (error) {
      throw new BadRequestException('Error creating brand: ' + error.message);
    }
  }

  @Get()
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const brand = await this.brandsService.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    try {
      return await this.brandsService.update(id, updateBrandDto);
    } catch (error) {
      throw new BadRequestException('Error updating brand: ' + error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.brandsService.remove(id);
      return { message: 'Brand deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Error deleting brand: ' + error.message);
    }
  }
}
