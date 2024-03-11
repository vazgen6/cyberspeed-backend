import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  username: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
