import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;
}
