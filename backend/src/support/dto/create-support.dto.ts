import { support } from '@prisma/client';

export type CreateSupportDto = Omit<
  support,
  'id' | 'created_at' | 'updated_at' | 'vehicles'
>;
