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
}
