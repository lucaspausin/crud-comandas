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
import { SupportImagesService } from './support_images.service';
import { UpdateSupportImageDto } from './dto/update-support_image.dto';
import * as multer from 'multer';

@Controller('support-images')
export class SupportImagesController {
  constructor(private readonly supportImagesService: SupportImagesService) {}

  @Post(':supportId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('supportId', ParseIntPipe) supportId: number,
  ) {
    if (!file || !file.buffer) {
      throw new Error('No file received or file is empty');
    }

    const supportExists =
      await this.supportImagesService.checkSupportExists(supportId);
    if (!supportExists) {
      throw new NotFoundException(`Support with ID ${supportId} not found`);
    }

    const fileUrl = await this.supportImagesService.uploadToS3(file);

    return this.supportImagesService.create(
      fileUrl,
      supportId,
      file.mimetype,
      file.originalname,
    );
  }

  @Get()
  findAll() {
    return this.supportImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supportImagesService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.supportImagesService.remove(id);
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
    @Body() updateDto: UpdateSupportImageDto,
  ) {
    return this.supportImagesService.update(id, updateDto);
  }
}
