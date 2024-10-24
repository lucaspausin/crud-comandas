import { clientes } from '@prisma/client';

export type CreateClientDto = Omit<
  clientes,
  'id' | 'creado_en' | 'actualizado_en'
>;
