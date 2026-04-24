import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para actualización de tareas.
 * Todos los campos son opcionales — solo se actualiza lo que se envía.
 */
export class UpdateTaskDto {

  @ApiProperty({ example: 'Tarea editada', description: 'Nuevo nombre' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(4, { message: 'El nombre debe tener mínimo 4 caracteres.' })
  @MaxLength(20, { message: 'El nombre debe tener máximo 20 caracteres.' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ]+)*$/, {
    message: 'El nombre solo puede contener letras y números. Sin espacios al inicio/fin ni caracteres especiales.',
  })
  name?: string;

  @ApiProperty({ example: 'Nueva descripcion', description: 'Nueva descripción' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(4, { message: 'La descripción debe tener mínimo 4 caracteres.' })
  @MaxLength(100, { message: 'La descripción debe tener máximo 100 caracteres.' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,;:¿?¡!-]+$/, {
    message: 'La descripción contiene caracteres no permitidos.',
  })
  description?: string;

  @ApiProperty({ example: false, description: 'Nueva prioridad' })
  @IsOptional()
  @IsBoolean({ message: 'La prioridad debe ser verdadero o falso.' })
  priority?: boolean;

  @ApiProperty({ example: 1, description: 'ID del usuario' })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de usuario debe ser un número.' })
  @IsInt({ message: 'El ID de usuario debe ser un número entero.' })
  user_id?: number;

}