import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Body,
  DefaultValuePipe,
  Patch,
} from '@nestjs/common';
import * as multer from 'multer'; // Asegúrate de importar multer
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalParseIntPipe } from '../pipes/optional-parse-int.pipe'; // Asegúrate de importar el pipe
import { UpdateFileDto } from './dto/update-file.dto';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':comandaId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('comandaId', ParseIntPipe) comandaId: number,
    @Body('usuarioId', OptionalParseIntPipe) usuarioId?: number, // Usar el pipe personalizado
  ) {
    if (!file || !file.buffer) {
      throw new Error('No file received or file is empty');
    }

    const comandaExists = await this.filesService.checkComandaExists(comandaId);
    if (!comandaExists) {
      throw new NotFoundException(`Comanda with ID ${comandaId} not found`);
    }

    // Subir el archivo a S3 y obtener la URL
    const fileUrl = await this.filesService.uploadToS3(file);

    // Crear el archivo en la base de datos con el nombre original
    return this.filesService.create(
      fileUrl,
      comandaId,
      file.mimetype,
      file.originalname,
      usuarioId, // Esto ahora puede ser null si no se proporciona
    );
  }

  @Get()
  async findAll() {
    return this.filesService.findAll();
  }

  @Get('update-metadata')
  async updateAllFilesMetadata() {
    try {
      await this.filesService.updateAllFilesMetadata(); // Llama a la función del servicio
      return { message: 'Metadatos de todos los archivos actualizados.' };
    } catch (error) {
      return {
        message: 'Error al actualizar los metadatos.',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      // Llama al servicio para eliminar el archivo de la base de datos y de S3
      await this.filesService.remove(id);
      return { message: 'Archivo eliminado correctamente' };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el archivo: ' + error.message,
      );
    }
  }

  @Patch(':id')
  async verifyFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFileDto,
  ) {
    const updatedFile = await this.filesService.update(id, body);
    return {
      message: 'Archivo verificado correctamente',
      file: updatedFile, // Devuelve el objeto actualizado
    };
  }
}
