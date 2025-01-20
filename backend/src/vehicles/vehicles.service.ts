import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const { support_ids, ...vehicleData } = createVehicleDto;

    // Verify brand exists
    const brand = await this.prisma.brands.findUnique({
      where: { id: vehicleData.brand_id },
    });

    if (!brand) {
      throw new BadRequestException(
        `Brand with ID ${vehicleData.brand_id} not found`,
      );
    }

    // Verify all supports exist
    if (support_ids && support_ids.length > 0) {
      const supports = await this.prisma.support.findMany({
        where: { id: { in: support_ids } },
      });

      if (supports.length !== support_ids.length) {
        throw new BadRequestException('One or more support IDs are invalid');
      }
    }

    // Create vehicle with support connections
    return this.prisma.vehicles.create({
      data: {
        ...vehicleData,
        support: {
          connect: support_ids?.map((id) => ({ id })) || [],
        },
      },
      include: {
        brands: true,
        support: {
          include: {
            support_images: true,
          },
        },
        vehicle_images: true,
      },
    });
  }

  findAll() {
    return this.prisma.vehicles.findMany({
      include: {
        brands: true,
        support: {
          include: {
            support_images: true,
          },
        },
        vehicle_images: true,
      },
    });
  }

  async findOne(id: number) {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id },
      include: {
        brands: true,
        support: {
          include: {
            support_images: true,
          },
        },
        vehicle_images: true,
      },
    });

    if (!vehicle) {
      throw new BadRequestException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const { support_ids, ...vehicleData } = updateVehicleDto;

    // Verify vehicle exists
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new BadRequestException(`Vehicle with ID ${id} not found`);
    }

    // If brand_id is being updated, verify new brand exists
    if (vehicleData.brand_id) {
      const brand = await this.prisma.brands.findUnique({
        where: { id: vehicleData.brand_id },
      });

      if (!brand) {
        throw new BadRequestException(
          `Brand with ID ${vehicleData.brand_id} not found`,
        );
      }
    }

    // If support_ids provided, verify all supports exist
    if (support_ids && support_ids.length > 0) {
      const supports = await this.prisma.support.findMany({
        where: { id: { in: support_ids } },
      });

      if (supports.length !== support_ids.length) {
        throw new BadRequestException('One or more support IDs are invalid');
      }
    }

    // Update vehicle with new support connections
    return this.prisma.vehicles.update({
      where: { id },
      data: {
        ...vehicleData,
        ...(support_ids && {
          support: {
            set: support_ids.map((id) => ({ id })),
          },
        }),
      },
      include: {
        brands: true,
        support: {
          include: {
            support_images: true,
          },
        },
        vehicle_images: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.vehicles.delete({
      where: { id },
    });
  }

  async findBySupport(supportId: number) {
    return this.prisma.vehicles.findMany({
      where: {
        support: {
          some: {
            id: supportId,
          },
        },
      },
      include: {
        brands: true,
        support: {
          include: {
            support_images: true,
          },
        },
        vehicle_images: true,
      },
    });
  }
}
