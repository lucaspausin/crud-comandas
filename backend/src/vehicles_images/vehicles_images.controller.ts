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
  Res,
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

  @Get('download/:id')
  async downloadImage(@Param('id', ParseIntPipe) id: number, @Res() res) {
    const image = await this.vehiclesImagesService.findOne(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const fileStream = await this.vehiclesImagesService.getS3FileStream(
      image.url,
    );
    res.set({
      'Content-Type': image.type,
      'Content-Disposition': `attachment; filename="${image.name}"`,
    });

    fileStream.pipe(res);
  }

  @Get('download-all/:vehicleId')
  async downloadAllImages(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Res() res,
  ) {
    const images =
      await this.vehiclesImagesService.findAllByVehicleId(vehicleId);
    if (!images || images.length === 0) {
      throw new NotFoundException('No images found for this vehicle');
    }

    const zipBuffer = await this.vehiclesImagesService.createImagesZip(images);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="vehicle-${vehicleId}-images.zip"`,
    });

    res.send(zipBuffer);
  }
}
