import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // Para generar un nombre único para los archivos
import { extname } from 'path';

@Injectable()
export class FilesService {
  private s3: AWS.S3;

  constructor(private prismaService: PrismaService) {
    // Configura la conexión a S3 usando las variables de entorno
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION, // Tomamos la región desde las variables de entorno
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Tomamos la accessKey desde las variables de entorno
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Tomamos la secretAccessKey desde las variables de entorno
    });
  }

  // Método para subir a S3
  async uploadToS3(file: Express.Multer.File): Promise<string> {
    const fileName = uuidv4() + extname(file.originalname); // Nombre del archivo único para S3
    const filePath = `uploads/${fileName}`;

    // Verificar si file.buffer está presente
    if (!file.buffer) {
      throw new Error('No se recibió el contenido del archivo.');
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET, // Asegúrate de que el bucket esté correctamente configurado
      Key: filePath,
      Body: file.buffer, // Contenido del archivo
      ContentType: file.mimetype,
      ContentDisposition: `attachment; filename="${file.originalname}"`,
    };

    try {
      // Subir archivo a S3
      const uploadResult = await this.s3.upload(params).promise();
      return uploadResult.Location; // Devuelve la URL del archivo subido en S3
    } catch (error) {
      throw new Error('Error al subir el archivo a S3: ' + error.message);
    }
  }

  async create(
    fileUrl: string,
    comandaId: number,
    mimetype: string,
    originalName: string,
    usuarioId: number,
  ) {
    return this.prismaService.archivo.create({
      data: {
        url: fileUrl,
        tipo: mimetype, // Guardar el tipo MIME real en la base de datos
        comanda_id: comandaId,
        nombre: originalName, // Almacenar el nombre original del archivo
        usuario_id: usuarioId,
      },
    });
  }

  async findAll() {
    return this.prismaService.archivo.findMany();
  }

  async findOne(id: number) {
    const archivo = await this.prismaService.archivo.findUnique({
      where: { id },
    });
    if (!archivo) throw new NotFoundException('Archivo no encontrado');
    return archivo;
  }

  async remove(id: number) {
    const archivo = await this.prismaService.archivo.findUnique({
      where: { id },
    });

    if (!archivo) throw new NotFoundException('Archivo no encontrado');

    // Eliminar archivo de S3
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: archivo.url.replace(
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
        '',
      ),
    };

    try {
      await this.s3.deleteObject(s3Params).promise(); // Eliminar archivo de S3
      console.log(`Archivo ${archivo.url} eliminado de S3`);
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el archivo de S3: ' + error.message,
      );
    }

    // Eliminar archivo de la base de datos
    return this.prismaService.archivo.delete({
      where: { id },
    });
  }
  // Método para verificar si la comanda existe
  async checkComandaExists(comandaId: number): Promise<boolean> {
    const comanda = await this.prismaService.comandas.findUnique({
      where: { id: comandaId },
    });
    return !!comanda;
  }

  async updateFileMetadata(url: string) {
    const key = url.replace(
      `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
      '',
    );

    console.log('Clave del archivo:', key); // Verifica la clave que obtienes

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key, // Usa la clave correctamente formateada
      ContentDisposition: 'attachment', // Forzar descarga
      MetadataDirective: 'REPLACE', // Reemplazar metadatos
    };

    try {
      await this.s3
        .copyObject({
          ...params,
          CopySource: `${process.env.AWS_S3_BUCKET}/${key}`, // Usa el key directamente
        })
        .promise();
      console.log(`Metadatos actualizados para: ${key}`);
    } catch (error) {
      console.error('Error al actualizar metadatos:', error);
    }
  }

  // Actualiza todos los archivos en la base de datos
  async updateAllFilesMetadata() {
    const files = await this.prismaService.archivo.findMany(); // Obtener todos los archivos desde la base de datos

    for (const file of files) {
      const fileKey = file.url.replace(
        `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET}/`,
        '',
      ); // Extrae la clave del archivo desde la URL

      await this.updateFileMetadata(fileKey); // Actualizar metadatos
    }
    return { message: 'Metadatos actualizados correctamente.' };
  }

  async update(id: number, updateFileDto: UpdateFileDto) {
    return this.prismaService.archivo.update({
      where: { id },
      data: updateFileDto,
    });
  }
}
