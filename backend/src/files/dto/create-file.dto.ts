import { archivo } from '@prisma/client';

export type CreateFileDto = Omit<
  archivo,
  'id' | 'creado_en' | 'actualizado_en'
>;
