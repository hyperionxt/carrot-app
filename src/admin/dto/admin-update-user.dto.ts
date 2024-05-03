import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/users/entities/user.entity';

export class AdminUpdateUserDto {
  @MinLength(2)
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @MinLength(8)
  @MaxLength(50)
  @IsOptional()
  @IsString()
  newPassword?: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&])[A-Za-z\d!@#$%&]+$/, {
    message:
      'The password must contain at least one uppercase letter, one lowercase letter, one number and one special character(@,#,$,%,&,!)',
  })
  @MinLength(8)
  @MaxLength(50)
  @IsOptional()
  @IsString()
  oldPassword?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

}
