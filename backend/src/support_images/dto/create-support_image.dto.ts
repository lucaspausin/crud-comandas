import { support_images } from '@prisma/client';

export type CreateSupportImageDto = Omit<
  support_images,
  'id' | 'creado_en' | 'actualizado_en'
>;
