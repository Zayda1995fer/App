import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";

export class UpdateTaskDto {

    @IsString({ message: "El nombre debe ser un texto" })
    @IsOptional()
    @MinLength(3, { message: "El nombre debe tener al menos 3 caracteres" })
    @MaxLength(50, { message: "El nombre no debe exceder los 50 caracteres" })
    name: string | undefined;

    @IsString({ message: "La descripción debe ser un texto" })
    @IsOptional()
    @MinLength(3, { message: "La descripción debe tener al menos 3 caracteres" })
    @MaxLength(250, { message: "La descripción no debe exceder los 250 caracteres" })
    description: string | undefined;

    @IsOptional()
    @IsBoolean({ message: "El estado debe ser un valor booleano" })
    priority: boolean | undefined;

}