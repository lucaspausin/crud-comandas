import { comandas } from '@prisma/client';

export type CreateCommandDto = Omit<
  comandas,
  | 'id'
  | 'creado_en'
  | 'actualizado_en'
  | 'reforma_escape'
  | 'carga_externa'
  | 'precio_carga_externa'
  | 'cuna'
>;
