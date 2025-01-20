import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateVehicleDto {
  @IsNumber()
  brand_id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  sales_suggestions?: string;

  @IsString()
  @IsOptional()
  cradle_type?: string;

  @IsBoolean()
  @IsOptional()
  exhaust_reform?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  support_ids?: number[];
}
