import { tecnica } from '@prisma/client';

export type CreateTechniqueDto = Omit<
  tecnica,
  | 'id'
  | 'creado_en'
  | 'actualizado_en'
  | 'detalle1'
  | 'detalle2'
  | 'detalle3'
  | 'detalle4'
>;
