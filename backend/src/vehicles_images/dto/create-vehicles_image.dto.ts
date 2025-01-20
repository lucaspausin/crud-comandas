import { vehicle_images } from '@prisma/client';

export type CreateVehiclesImageDto = Omit<
  vehicle_images,
  'id' | 'created_at' | 'updated_at'
>;
