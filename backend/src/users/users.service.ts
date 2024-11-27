import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuarios.findMany();
  }

  async findOne(id: number) {
    return this.prisma.usuarios.findUnique({
      where: { id },
      include: { roles: true },
    });
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.contrase_a, 10);
    return this.prisma.usuarios.create({
      data: { ...data, contrase_a: hashedPassword },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    // Cambiado para usar UpdateUserDto
    if (data.contrase_a) {
      // Cambiado 'password' a 'contrase_a'
      data.contrase_a = await bcrypt.hash(data.contrase_a, 10);
    }
    return this.prisma.usuarios.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.usuarios.delete({ where: { id } });
  }
}
