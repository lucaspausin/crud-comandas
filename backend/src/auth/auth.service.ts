// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const user = await this.prisma.usuarios.findFirst({
      where: {
        OR: [
          { nombre_usuario: authDto.nombre_usuario },
          { email: authDto.email },
        ],
      },
    });

    if (user && (await bcrypt.compare(authDto.contrase_a, user.contrase_a))) {
      const payload: JwtPayload = {
        sub: user.id,
        username: user.nombre_usuario,
        role: user.role_id,
      };

      return {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
        role: user.role_id,
        token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  async refreshToken(user: any) {
    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(userData: any) {
    try {
      let user = await this.prisma.usuarios.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        // Formatear el nombre de usuario
        const formattedUsername = userData.nombre_usuario
          .toLowerCase()
          .replace(/\s+/g, '');

        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await this.prisma.usuarios.create({
          data: {
            email: userData.email,
            nombre_usuario: formattedUsername,
            contrase_a: hashedPassword,
            cover_image: userData.cover_image,
            role_id: 4,
          },
        });
      }

      const payload: JwtPayload = {
        sub: user.id,
        username: user.nombre_usuario,
        role: user.role_id,
      };

      return {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
        role: user.role_id,
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Error en googleLogin:', error);
      throw new UnauthorizedException('Error al procesar el login con Google');
    }
  }

  async googleRegister(userData: any) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.usuarios.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new UnauthorizedException('El email ya está registrado');
      }

      // Formatear el nombre de usuario
      const formattedUsername = userData.nombre_usuario
        .toLowerCase()
        .replace(/\s+/g, '');

      // Crear nuevo usuario
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = await this.prisma.usuarios.create({
        data: {
          email: userData.email,
          nombre_usuario: formattedUsername,
          contrase_a: hashedPassword,
          cover_image: userData.cover_image,
          role_id: 4,
        },
      });

      const payload: JwtPayload = {
        sub: newUser.id,
        username: newUser.nombre_usuario,
        role: newUser.role_id,
      };

      return {
        id: newUser.id,
        nombre_usuario: newUser.nombre_usuario,
        email: newUser.email,
        role: newUser.role_id,
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Error en googleRegister:', error);
      throw new UnauthorizedException(
        error.message || 'Error al registrar con Google',
      );
    }
  }
}
