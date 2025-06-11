import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

interface IUserDTO {
  username?: string,
  email?: string,
  password?: string,
}

export class UserDTO {
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;


  access_token: any = null;

  constructor({ username, email, password }: IUserDTO) {
    this.username = username || '';
    this.email = email || '';
    this.password = password || '';
  }
}
