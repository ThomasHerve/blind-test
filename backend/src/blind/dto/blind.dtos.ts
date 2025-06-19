import { IsNotEmpty, MinLength } from "class-validator";

export class CreateBlindDto {
    @IsNotEmpty()
    @MinLength(3)
    title: string
}

export class AddCollaboratorDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    id: number;
}

export class DeleteBlindDto {
    @IsNotEmpty()
    id: number;
}