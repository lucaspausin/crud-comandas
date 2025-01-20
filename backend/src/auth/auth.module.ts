import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller'; // Importa el controlador aquí
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, PrismaService],
  exports: [AuthService],
  controllers: [AuthController], // Asegúrate de registrar el controlador aquí
})
export class AuthModule {}
