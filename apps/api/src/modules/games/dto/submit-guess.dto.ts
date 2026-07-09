import { IsString, Length, Matches } from 'class-validator';

export class SubmitGuessDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'guess 必须是4位数字' })
  guess!: string;
}
