import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthUser } from "../../common/types/auth-user";
import { PersistStorageDto } from "./dto/persist-storage.dto";
import { StorageService } from "./storage.service";
import { maxBytesForKind, resolveUploadKind } from "./upload-policy";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@Controller("storage")
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /** 头像直传永久目录 avatars/{userId}/ */
  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  async uploadAvatar(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    const uploaded = this.uploadImageFile(file);
    const result = await this.storageService.uploadAvatar(
      user.id,
      uploaded.buffer,
      uploaded.mimeType,
    );
    const url = await this.storageService.getAccessUrl(result.ossKey);

    return {
      ossKey: result.ossKey,
      url,
      mimeType: result.mimeType,
    };
  }

  /** 临时上传至 temp/{userId}/，供反馈等场景预览 */
  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  async uploadTemp(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    const uploaded = this.uploadImageFile(file);
    const result = await this.storageService.uploadTemp(
      user.id,
      uploaded.buffer,
      uploaded.mimeType,
    );
    const url = await this.storageService.getTempPreviewUrl(result.ossKey);

    return {
      ossKey: result.ossKey,
      url,
      mimeType: result.mimeType,
    };
  }

  /** 保存时将 temp 文件复制到永久目录 */
  @Post("persist")
  async persist(@CurrentUser() user: AuthUser, @Body() dto: PersistStorageDto) {
    const files = await this.storageService.persistFromTemp(
      user.id,
      dto.ossKeys,
      dto.scope ?? "general",
    );

    return { files };
  }

  private uploadImageFile(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("请上传文件");
    }

    const kind = resolveUploadKind(file.mimetype);
    if (!kind) {
      throw new BadRequestException("仅支持 JPG/PNG/WEBP 图片");
    }

    const maxSize = maxBytesForKind(kind);
    if (file.size > maxSize) {
      throw new BadRequestException(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    return { buffer: file.buffer, mimeType: file.mimetype };
  }
}
