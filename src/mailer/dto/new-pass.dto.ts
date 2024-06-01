import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class newPassDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  newPassword: string;
}
