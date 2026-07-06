import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'avatarUrl 必须是有效 URL' })
  avatarUrl?: string;
}
