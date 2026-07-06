import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import { randomUUID } from 'crypto';

export type PersistedObject = {
  ossKey: string;
  mimeType: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: OSS | null;
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.mockMode = config.get<string>('STORAGE_MOCK') === 'true';
    const region = config.get<string>('OSS_REGION');
    const accessKeyId = config.get<string>('OSS_ACCESS_KEY_ID');
    const accessKeySecret = config.get<string>('OSS_ACCESS_KEY_SECRET');
    const bucket = config.get<string>('OSS_BUCKET');

    if (!this.mockMode && region && accessKeyId && accessKeySecret && bucket) {
      this.client = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        endpoint: config.get<string>('OSS_ENDPOINT') || undefined,
        secure: true,
      });
      this.logger.log(`OSS 已启用（Bucket: ${bucket}）`);
    } else {
      this.client = null;
      if (!this.mockMode) {
        this.logger.warn('OSS 凭证不完整，请检查 .env 或设置 STORAGE_MOCK=true');
      }
    }
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<PersistedObject> {
    if (this.mockMode) {
      this.logger.debug(`Mock upload: ${key}`);
      return { ossKey: key, mimeType };
    }
    if (!this.client) {
      throw new ServiceUnavailableException(
        '对象存储未配置，请设置 STORAGE_MOCK=true 或填写 OSS 凭证',
      );
    }
    await this.client.put(key, buffer, {
      headers: { 'Content-Type': mimeType },
    });
    return { ossKey: key, mimeType };
  }

  async uploadTemp(userId: number, buffer: Buffer, mimeType: string) {
    const ext =
      mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';
    const key = `temp/${userId}/${randomUUID()}.${ext}`;
    return this.uploadBuffer(key, buffer, mimeType);
  }

  async getAccessUrl(ossKey: string, expiresSeconds = 3600 * 24 * 7) {
    const publicBase = this.config.get<string>('OSS_PUBLIC_BASE');
    if (publicBase) {
      return `${publicBase.replace(/\/$/, '')}/${ossKey}`;
    }
    if (this.mockMode) {
      return `https://mock.local/${ossKey}`;
    }
    if (!this.client) {
      throw new ServiceUnavailableException('对象存储未配置');
    }
    return this.client.signatureUrl(ossKey, { expires: expiresSeconds });
  }
}
