// dto/auth.dto.ts
import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  nombre_usuario?: string;

  @IsString()
  email?: string;

  @IsString()
  contrase_a: string;
}
