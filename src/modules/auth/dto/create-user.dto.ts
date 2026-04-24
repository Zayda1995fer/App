// src/modules/auth/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsString,
  Matches, MaxLength, MinLength,
} from 'class-validator';

export class CreateUserDto {

  @ApiProperty({ example: 'Zayda' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(4, { message: 'El nombre debe tener mínimo 4 caracteres.' })
  @MaxLength(20, { message: 'El nombre debe tener máximo 20 caracteres.' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*$/, {
    message: 'El nombre solo puede contener letras. Sin espacios al inicio/fin ni caracteres especiales.',
  })
  name!: string;

  @ApiProperty({ example: 'Vargas' })
  @IsString({ message: 'El apellido debe ser texto.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MinLength(4, { message: 'El apellido debe tener mínimo 4 caracteres.' })
  @MaxLength(20, { message: 'El apellido debe tener máximo 20 caracteres.' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*$/, {
    message: 'El apellido solo puede contener letras. Sin espacios al inicio/fin ni caracteres especiales.',
  })
  lastname!: string;

  @ApiProperty({ example: 'zayda@correo.com' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío.' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres.' })
  email!: string;

  @ApiProperty({ example: 'Segura@123' })
  @IsString({ message: 'La contraseña debe ser texto.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres.' })
  @MaxLength(20, { message: 'La contraseña debe tener máximo 20 caracteres.' })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, {
    message: 'La contraseña debe tener al menos una mayúscula, un número y un carácter especial.',
  })
  password!: string;

}