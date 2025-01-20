import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(createSupportDto: CreateSupportDto) {
    const existingSupport = await this.prisma.support.findUnique({
      where: { code: createSupportDto.code },
    });

    if (existingSupport) {
      throw new BadRequestException(
        `Support with code ${createSupportDto.code} already exists`,
      );
    }

    return this.prisma.support.create({
      data: createSupportDto,
      include: {
        support_images: true,
        vehicles: {
          include: {
            brands: true,
            vehicle_images: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.support.findMany({
      include: {
        support_images: true,
      },
    });
  }

  async findOne(id: number) {
    const support = await this.prisma.support.findUnique({
      where: { id },
      include: {
        support_images: true,
        vehicles: {
          include: {
            brands: true,
            vehicle_images: true,
          },
        },
      },
    });

    if (!support) {
      throw new BadRequestException(`Support with ID ${id} not found`);
    }

    return support;
  }

  async update(id: number, updateSupportDto: UpdateSupportDto) {
    const support = await this.prisma.support.findUnique({
      where: { id },
    });

    if (!support) {
      throw new BadRequestException(`Support with ID ${id} not found`);
    }

    if (updateSupportDto.code) {
      const existingSupport = await this.prisma.support.findFirst({
        where: {
          code: updateSupportDto.code,
          id: { not: id },
        },
      });

      if (existingSupport) {
        throw new BadRequestException(
          `Support with code ${updateSupportDto.code} already exists`,
        );
      }
    }

    return this.prisma.support.update({
      where: { id },
      data: updateSupportDto,
      include: {
        support_images: true,
        vehicles: {
          include: {
            brands: true,
            vehicle_images: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.support.delete({
      where: { id },
    });
  }
}
