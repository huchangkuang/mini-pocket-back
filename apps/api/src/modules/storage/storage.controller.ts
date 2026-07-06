import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/types/auth-user';
import { StorageService } from './storage.service';
import { maxBytesForKind, resolveUploadKind } from './upload-policy';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    const kind = resolveUploadKind(file.mimetype);
    if (!kind) {
      throw new BadRequestException('仅支持 JPG/PNG/WEBP 图片');
    }

    const maxSize = maxBytesForKind(kind);
    if (file.size > maxSize) {
      throw new BadRequestException(
        `图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
    }

    const result = await this.storageService.uploadTemp(
      user.id,
      file.buffer,
      file.mimetype,
    );
    const url = await this.storageService.getAccessUrl(result.ossKey);

    return {
      ossKey: result.ossKey,
      url,
      mimeType: result.mimeType,
    };
  }
}
