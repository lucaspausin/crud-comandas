import { APP_FILTER, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Define un prefijo global para las rutas de la API
  app.setGlobalPrefix('api');

  // Habilita CORS
  app.enableCors();

  // Configura la carpeta 'uploads' para servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Los archivos estarán disponibles en /uploads/<nombre_del_archivo>
  });

  // Inicia el servidor en el puerto especificado en el entorno o en el puerto 4000
  await app.listen(process.env.PORT ?? 3000);
  // 4000local
}
dotenv.config();
bootstrap();

declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};
