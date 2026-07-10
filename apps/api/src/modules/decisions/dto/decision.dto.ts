import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class DecisionBodyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  title!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(20, { each: true })
  options!: string[];
}

export class UpdateDecisionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  title?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(20, { each: true })
  options?: string[];
}
