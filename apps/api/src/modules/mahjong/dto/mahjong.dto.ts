import { IsArray, ArrayMinSize, ArrayMaxSize, IsInt, IsString, MinLength, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class SaveDraftDto {
  /** 四席分数；允许 null 表示未填。省略座位请传 null，不要省略数组元素。 */
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  scores!: Array<number | null>;
}

export class UpdateRoundDto {
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  @Type(() => Number)
  scores!: [number, number, number, number];
}

export class JoinBySceneDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  scene!: string;
}
