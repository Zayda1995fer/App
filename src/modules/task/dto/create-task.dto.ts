import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {

  @IsString( {message: 'Nombre es requerido' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ description: 'Ejemplo 1', example: 'Tarea 1' })
  name: string;
 

  @IsString( {message: 'Nombre es requerido' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  @IsNotEmpty()
  @ApiProperty({ description: 'Ejemplo 2', example: 'Tarea 2' })
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ description: 'Ejemplo 3', example: true })
  priority: boolean;



  @IsNumber()
@IsInt() 
@ApiProperty({ description: 'Ejemplo 4', example: 1 })
  user_id: number;


}
