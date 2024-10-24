import { boletos_reservas, clientes } from '@prisma/client';

export type CreateReservationDto = Omit<
  boletos_reservas,
  | 'id'
  | 'reforma_escape'
  | 'carga_externa'
  | 'creado_en'
  | 'actualizado_en'
  | 'sena'
> &
  Omit<clientes, 'id' | 'creado_en' | 'actualizado_en'>;
