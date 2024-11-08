import { calendario } from '@prisma/client';

export type CreateCalendarDto = Omit<
  calendario,
  | 'id'
  | 'descripcion'
  | 'creado_en'
  | 'actualizado_en'
>; 
