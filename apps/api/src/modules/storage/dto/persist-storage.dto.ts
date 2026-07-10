import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export const PERSIST_SCOPES = ["feedback", "general"] as const;
export type PersistScope = (typeof PERSIST_SCOPES)[number];

export class PersistStorageDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  ossKeys!: string[];

  @IsOptional()
  @IsIn(PERSIST_SCOPES)
  scope?: PersistScope;
}
