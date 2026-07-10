import { Type } from "class-transformer";
import { IsInt, IsString, MinLength, ValidateIf } from "class-validator";

export class RecordToolUseDto {
  @ValidateIf((dto: RecordToolUseDto) => !dto.routePath)
  @Type(() => Number)
  @IsInt()
  toolId?: number;

  @ValidateIf((dto: RecordToolUseDto) => !dto.toolId)
  @IsString()
  @MinLength(1)
  routePath?: string;
}

export type RecordToolUseInput = Pick<RecordToolUseDto, "toolId" | "routePath">;
