import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'avatarUrl 必须是有效 URL' })
  avatarUrl?: string;
}
