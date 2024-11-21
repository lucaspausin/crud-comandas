import { tecnica } from '@prisma/client';

export type CreateTechniqueDto = Omit<
  tecnica,
  | 'id'
  | 'creado_en'
  | 'actualizado_en'
  | 'detalle1' // El campo 'detalle1' se omite
  | 'detalle2' // El campo 'detalle2' se omite
  | 'detalle3' // El campo 'detalle3' se omite
  | 'detalle4' // El campo 'detalle4' se omite
  | 'detalle5' // El campo 'detalle5' se omite
  | 'detalle6' // El campo 'detalle6' se omite
  | 'detalle7' // El campo 'detalle7' se omite
  | 'detalle8' // El campo 'detalle8' se omite
  | 'detalle9' // El campo 'detalle9' se omite
  | 'detalle10' // El campo 'detalle10' se omite
  | 'detalle11' // El campo 'detalle11' se omite
  | 'detalle12' // El campo 'detalle12' se omite
  | 'detalle13' // El campo 'detalle13' se omite
  | 'detalle14' // El campo 'detalle14' se omite
  | 'detalle15' // El campo 'detalle15' se omite
  | 'detalle16' // El campo 'detalle16' se omite
  | 'detalle17' // El campo 'detalle17' se omite
  | 'detalle18' // El campo 'detalle18' se omite
  | 'detalle19' // El campo 'detalle19' se omite
  | 'detalle20'
>;
