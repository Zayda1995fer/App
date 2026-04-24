import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para creación de tareas.
 * - No permite campos en blanco ni espacios al inicio/fin
 * - No permite scripts ni caracteres peligrosos (XSS)
 * - Mínimo 4, máximo 20 caracteres en nombre
 * - Mínimo 4, máximo 100 caracteres en descripción
 */
export class CreateTaskDto {

  @ApiProperty({ example: 'Revisar informe', description: 'Nombre de la tarea' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(4, { message: 'El nombre debe tener mínimo 4 caracteres.' })
  @MaxLength(20, { message: 'El nombre debe tener máximo 20 caracteres.' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ]+(\s[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ]+)*$/, {
    message: 'El nombre solo puede contener letras y números. Sin espacios al inicio/fin ni caracteres especiales.',
  })
  name!: string;

  @ApiProperty({ example: 'Descripcion de la tarea', description: 'Descripción' })
  @IsString({ message: 'La descripción debe ser texto.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(4, { message: 'La descripción debe tener mínimo 4 caracteres.' })
  @MaxLength(100, { message: 'La descripción debe tener máximo 100 caracteres.' })
  @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,;:¿?¡!-]+$/, {
    message: 'La descripción contiene caracteres no permitidos.',
  })
  description!: string;

  @ApiProperty({ example: true, description: 'Prioridad alta o normal' })
  @IsBoolean({ message: 'La prioridad debe ser verdadero o falso.' })
  @IsNotEmpty({ message: 'La prioridad no puede estar vacía.' })
  priority!: boolean;

  @ApiProperty({ example: 1, description: 'ID del usuario asignado' })
  @IsNumber({}, { message: 'El ID de usuario debe ser un número.' })
  @IsInt({ message: 'El ID de usuario debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID de usuario no puede estar vacío.' })
  user_id!: number;

}