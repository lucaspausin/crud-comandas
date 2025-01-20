import { brands } from '@prisma/client';

export type CreateBrandDto = Omit<
  brands,
  'id' | 'created_at' | 'updated_at' | 'vehicles'
>;
