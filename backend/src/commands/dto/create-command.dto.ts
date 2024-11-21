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
  | 'cilindro_3_cod'
  | 'cilindro_3_numero'
  | 'valvula_3_cod'
  | 'valvula_3_numero'
  | 'cilindro_4_cod'
  | 'cilindro_4_numero'
  | 'valvula_4_cod'
  | 'valvula_4_numero'
  | 'pagos_tarjeta_3'
  | 'pagos_plan_tarjeta_3'
  | 'pagos_tarjeta_4'
  | 'pagos_plan_tarjeta_4'
  | 'pagos_tarjeta_5'
  | 'pagos_plan_tarjeta_5'
>;
