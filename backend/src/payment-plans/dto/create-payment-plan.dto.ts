import { payment_plans } from '@prisma/client';

export type CreatePaymentPlanDto = Omit<
  payment_plans,
  'id' | 'created_at' | 'updated_at'
>; 