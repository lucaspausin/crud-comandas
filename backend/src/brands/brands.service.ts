import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brands.create({
      data: createBrandDto,
    });
  }

  async findAll() {
    return this.prisma.brands.findMany({});
  }

  async findOne(id: number) {
    return this.prisma.brands.findUnique({
      where: { id },
      include: {
        vehicles: true,
      },
    });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    return this.prisma.brands.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: number) {
    return this.prisma.brands.delete({
      where: { id },
    });
  }
}
