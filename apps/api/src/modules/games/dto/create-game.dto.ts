import { IsString, Length, Matches } from "class-validator";

export class CreateGameDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: "targetNumber 必须是4位数字" })
  targetNumber!: string;
}
