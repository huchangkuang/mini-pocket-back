import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

const FEEDBACK_TYPES = ["feature", "performance", "style", "other"] as const;

export class CreateFeedbackDto {
  @IsIn(FEEDBACK_TYPES)
  type!: (typeof FEEDBACK_TYPES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  imageUrls?: string[];
}
