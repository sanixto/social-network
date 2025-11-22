import { IsString, IsStrongPassword } from 'class-validator';

export class SignInDto {
  @IsString()
  username: string;

  @IsStrongPassword()
  password: string;
}
