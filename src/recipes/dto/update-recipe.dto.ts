import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsOptional()
  @IsString()
  country?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsArray()
  @IsOptional()
  ingredients?: string[];
  @IsString()
  @IsOptional()
  instructions?: string;

}
