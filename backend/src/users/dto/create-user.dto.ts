import { usuarios } from '@prisma/client';

export type CreateUserDto = Omit<
  usuarios,
  | 'id'
  | 'creado_en'
  | 'actualizado_en'
  | 'cover_image'
>;
