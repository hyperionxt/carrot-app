import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  country: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsArray()
  @IsNotEmpty()
  ingredients: string;
  @IsString()
  @IsNotEmpty()
  instructions: string;
}
