import { IsNotEmpty, MinLength } from "class-validator";

export class CreateBlindDto {
    @IsNotEmpty()
    @MinLength(3)
    title: string
}

export class AddCollaboratorDto {
    @IsNotEmpty()
    @MinLength(1)
    username: string

    @IsNotEmpty()
    @MinLength(1)
    id: number
}

export class DeleteBlindDto {
    @IsNotEmpty()
    id: number;
}