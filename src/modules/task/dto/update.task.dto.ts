import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {

  @IsString( {message: 'Nombre es requerido' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;
 

  @IsString( {message: 'Nombre es requerido' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  priority: boolean;
}
