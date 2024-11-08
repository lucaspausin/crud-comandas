// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

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
      const payload = {
        username: user.nombre_usuario,
        sub: user.id,
        role: user.role_id,
      };
      return {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        email: user.email,
        role: user.role_id,
        token: this.jwtService.sign(payload),
        cover_image: user.cover_image,
      };
    }
    throw new UnauthorizedException('Credenciales incorrectas');
  }
}
