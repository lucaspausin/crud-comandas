import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSupportImageDto } from './dto/update-support_image.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class SupportImagesService {
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
    const filePath = `support/${fileName}`;

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
    supportId: number,
    mimetype: string,
    originalName: string,
  ) {
    return this.prismaService.support_images.create({
      data: {
        url: fileUrl,
        type: mimetype,
        support_id: supportId,
        name: originalName,
      },
    });
  }

  async findAll() {
    return this.prismaService.support_images.findMany();
  }

  async findOne(id: number) {
    const image = await this.prismaService.support_images.findUnique({
      where: { id },
    });
    if (!image) throw new NotFoundException('Imagen no encontrada');
    return image;
  }

  async remove(id: number) {
    const image = await this.prismaService.support_images.findUnique({
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

      return this.prismaService.support_images.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el archivo de S3: ' + error.message,
      );
    }
  }

  async checkSupportExists(supportId: number): Promise<boolean> {
    const support = await this.prismaService.support.findUnique({
      where: { id: supportId },
    });
    return !!support;
  }

  async update(id: number, updateDto: UpdateSupportImageDto) {
    return this.prismaService.support_images.update({
      where: { id },
      data: updateDto,
    });
  }
}
