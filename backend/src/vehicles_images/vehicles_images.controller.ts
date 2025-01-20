import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehiclesImagesService } from './vehicles_images.service';
import { UpdateVehiclesImageDto } from './dto/update-vehicles_image.dto';
import * as multer from 'multer';

@Controller('vehicles-images')
export class VehiclesImagesController {
  constructor(private readonly vehiclesImagesService: VehiclesImagesService) {}

  @Post(':vehicleId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    if (!file || !file.buffer) {
      throw new Error('No file received or file is empty');
    }

    const vehicleExists =
      await this.vehiclesImagesService.checkVehicleExists(vehicleId);
    if (!vehicleExists) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    const fileUrl = await this.vehiclesImagesService.uploadToS3(file);

    return this.vehiclesImagesService.create(
      fileUrl,
      vehicleId,
      file.mimetype,
      file.originalname,
    );
  }

  @Get()
  findAll() {
    return this.vehiclesImagesService.findAll();
  }

  @Get('update-metadata')
  async updateAllFilesMetadata() {
    try {
      await this.vehiclesImagesService.updateAllFilesMetadata();
      return { message: 'Metadatos de todos los archivos actualizados.' };
    } catch (error) {
      return {
        message: 'Error al actualizar los metadatos.',
        error: error.message,
      };
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesImagesService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.vehiclesImagesService.remove(id);
      return { message: 'Archivo eliminado correctamente' };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el archivo: ' + error.message,
      );
    }
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateVehiclesImageDto,
  ) {
    return this.vehiclesImagesService.update(id, updateDto);
  }
}
