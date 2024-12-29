import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
