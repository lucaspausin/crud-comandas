import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateVehiclesImageDto } from './dto/update-vehicles_image.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class VehiclesImagesService {
  private s3: AWS.S3;

  constructor(private prismaService: PrismaService) {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadToS3(file: Express.Multer.File): Promise<string> {
    const fileName = uuidv4() + extname(file.originalname);
    const filePath = `vehicles/${fileName}`;

    if (!file.buffer) {
      throw new Error('No se recibió el contenido del archivo.');
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `attachment; filename="${file.originalname}"`,
    };

    try {
      const uploadResult = await this.s3.upload(params).promise();
      return uploadResult.Location;
    } catch (error) {
      throw new Error('Error al subir el archivo a S3: ' + error.message);
    }
  }

  async create(
    fileUrl: string,
    vehicleId: number,
    mimetype: string,
    originalName: string,
  ) {
    return this.prismaService.vehicle_images.create({
      data: {
        url: fileUrl,
        type: mimetype,
        vehicle_id: vehicleId,
        name: originalName,
      },
    });
  }

  async findAll() {
    return this.prismaService.vehicle_images.findMany();
  }

  async findOne(id: number) {
    const image = await this.prismaService.vehicle_images.findUnique({
      where: { id },
    });
    if (!image) throw new NotFoundException('Imagen no encontrada');
    return image;
  }

  async remove(id: number) {
    const image = await this.prismaService.vehicle_images.findUnique({
      where: { id },
    });

    if (!image) throw new NotFoundException('Imagen no encontrada');

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: image.url.replace(
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
        '',
      ),
    };

    try {
      await this.s3.deleteObject(s3Params).promise();
      console.log(`Archivo ${image.url} eliminado de S3`);

      return this.prismaService.vehicle_images.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el archivo de S3: ' + error.message,
      );
    }
  }

  async checkVehicleExists(vehicleId: number): Promise<boolean> {
    const vehicle = await this.prismaService.vehicles.findUnique({
      where: { id: vehicleId },
    });
    return !!vehicle;
  }

  async update(id: number, updateDto: UpdateVehiclesImageDto) {
    return this.prismaService.vehicle_images.update({
      where: { id },
      data: updateDto,
    });
  }

  async updateFileMetadata(url: string) {
    const key = url.replace(
      `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
      '',
    );

    console.log('Clave del archivo:', key);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentDisposition: 'attachment',
      MetadataDirective: 'REPLACE',
    };

    try {
      await this.s3
        .copyObject({
          ...params,
          CopySource: `${process.env.AWS_S3_BUCKET}/${key}`,
        })
        .promise();
      console.log(`Metadatos actualizados para: ${key}`);
    } catch (error) {
      console.error('Error al actualizar metadatos:', error);
    }
  }

  async updateAllFilesMetadata() {
    const files = await this.prismaService.vehicle_images.findMany();

    for (const file of files) {
      const fileKey = file.url.replace(
        `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET}/`,
        '',
      );
      await this.updateFileMetadata(fileKey);
    }
    return { message: 'Metadatos actualizados correctamente.' };
  }
}
