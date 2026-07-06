import { IsInt, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class FavoriteActionDto {
  @ValidateIf((dto: FavoriteActionDto) => !dto.routePath)
  @Type(() => Number)
  @IsInt()
  toolId?: number;

  @ValidateIf((dto: FavoriteActionDto) => !dto.toolId)
  @IsString()
  @MinLength(1)
  routePath?: string;
}

export class QueryFavoritesDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
