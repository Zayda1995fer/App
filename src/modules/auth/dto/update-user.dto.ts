import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsOptional, IsString,
  Matches, MaxLength, MinLength,
} from 'class-validator';

/**
 * DTO actualización de usuario.
 * Solo permite cambiar name y lastname.
 * email y password NO están declarados — whitelist:true los descarta.
 */
export class UpdateUserDto {

  @ApiProperty({ example: 'Zayda' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(4, { message: 'El nombre debe tener mínimo 4 caracteres.' })
  @MaxLength(20, { message: 'El nombre debe tener máximo 20 caracteres.' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*$/, {
    message: 'El nombre solo puede contener letras. Sin espacios al inicio/fin ni caracteres especiales.',
  })
  name?: string;

  @ApiProperty({ example: 'Vargas' })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto.' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío si se envía.' })
  @MinLength(4, { message: 'El apellido debe tener mínimo 4 caracteres.' })
  @MaxLength(20, { message: 'El apellido debe tener máximo 20 caracteres.' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*$/, {
    message: 'El apellido solo puede contener letras. Sin espacios al inicio/fin ni caracteres especiales.',
  })
  lastname?: string;

  // ❌ email NO incluido — no se puede modificar
  // ❌ password NO incluido — no se puede modificar

}