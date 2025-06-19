import { IsNotEmpty, IsString, IsNumber } from "class-validator";

/** Interface pour la création d'une Blind */
export interface ICreateBlindDto {
  title?: string;
}

/** DTO pour la création d'une Blind */
export class CreateBlindDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  constructor({ title }: ICreateBlindDto) {
    this.title = title || '';
  }
}

/** Interface pour l'ajout d'un collaborateur */
export interface IAddCollaboratorDto {
  username: string;
  id: number;
}

/** DTO pour l'ajout d'un collaborateur */
export class AddCollaboratorDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsNumber()
  id: number;

  constructor({ username, id }: IAddCollaboratorDto) {
    this.username = username;
    this.id = id;
  }
}

/** Interface pour la suppression d'un collaborateur */
export interface IRemoveCollaboratorDto {
  username: string;
  id: number;
}

/** DTO pour la suppression d'un collaborateur */
export class RemoveCollaboratorDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsNumber()
  id: number;

  constructor({ username, id }: IRemoveCollaboratorDto) {
    this.username = username;
    this.id = id;
  }
}

/** Interface pour la suppression d'une Blind */
export interface IDeleteBlindDto {
  id: number;
}

/** DTO pour la suppression d'une Blind */
export class DeleteBlindDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  constructor({ id }: IDeleteBlindDto) {
    this.id = id;
  }
}
