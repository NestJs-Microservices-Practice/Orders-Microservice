import { ArrayMinSize, IsArray, IsBoolean, IsOptional } from "class-validator";

export class ValidateProductsDto {
  @IsArray()
  @ArrayMinSize(1)
  ids: number[];

  @IsBoolean()
  @IsOptional()
  available?: boolean = true;
}