import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OSS from "ali-oss";
import { randomUUID } from "crypto";
import type { PersistScope } from "./dto/persist-storage.dto";

export type PersistedObject = {
  ossKey: string;
  mimeType: string;
};

export type PersistedFileResult = {
  ossKey: string;
  url: string;
  sourceOssKey: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: OSS | null;
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.mockMode = config.get<string>("STORAGE_MOCK") === "true";
    const region = config.get<string>("OSS_REGION");
    const accessKeyId = config.get<string>("OSS_ACCESS_KEY_ID");
    const accessKeySecret = config.get<string>("OSS_ACCESS_KEY_SECRET");
    const bucket = config.get<string>("OSS_BUCKET");

    if (!this.mockMode && region && accessKeyId && accessKeySecret && bucket) {
      this.client = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        endpoint: config.get<string>("OSS_ENDPOINT") || undefined,
        secure: true,
      });
      this.logger.log(`OSS 已启用（Bucket: ${bucket}）`);
    } else {
      this.client = null;
      if (!this.mockMode) {
        this.logger.warn("OSS 凭证不完整，请检查 .env 或设置 STORAGE_MOCK=true");
      }
    }
  }

  async uploadBuffer(key: string, buffer: Buffer, mimeType: string): Promise<PersistedObject> {
    if (this.mockMode) {
      this.logger.debug(`Mock upload: ${key}`);
      return { ossKey: key, mimeType };
    }
    if (!this.client) {
      throw new ServiceUnavailableException(
        "对象存储未配置，请设置 STORAGE_MOCK=true 或填写 OSS 凭证",
      );
    }
    await this.client.put(key, buffer, {
      headers: { "Content-Type": mimeType },
    });
    return { ossKey: key, mimeType };
  }

  /** 临时上传（7 天生命周期目录），供反馈等场景选图预览 */
  async uploadTemp(userId: number, buffer: Buffer, mimeType: string) {
    const ext = this.resolveExtension(mimeType);
    const key = `temp/${userId}/${randomUUID()}.${ext}`;
    return this.uploadBuffer(key, buffer, mimeType);
  }

  /** 头像直传永久目录 avatars/{userId}/ */
  async uploadAvatar(userId: number, buffer: Buffer, mimeType: string) {
    const ext = this.resolveExtension(mimeType);
    const key = `avatars/${userId}/${randomUUID()}.${ext}`;
    return this.uploadBuffer(key, buffer, mimeType);
  }

  /** 将 temp 文件复制到永久目录，保存业务数据时调用 */
  async persistFromTemp(
    userId: number,
    ossKeys: string[],
    scope: PersistScope,
  ): Promise<PersistedFileResult[]> {
    const uniqueKeys = [...new Set(ossKeys)];
    const results: PersistedFileResult[] = [];

    for (const sourceKey of uniqueKeys) {
      this.assertTempKeyOwnedByUser(sourceKey, userId);
      const ext = this.extractExtension(sourceKey);
      const destKey = `${scope}/${userId}/${randomUUID()}.${ext}`;

      if (this.mockMode) {
        results.push({
          ossKey: destKey,
          url: await this.getAccessUrl(destKey),
          sourceOssKey: sourceKey,
        });
        continue;
      }

      if (!this.client) {
        throw new ServiceUnavailableException("对象存储未配置");
      }

      await this.client.copy(destKey, sourceKey);
      results.push({
        ossKey: destKey,
        url: await this.getAccessUrl(destKey),
        sourceOssKey: sourceKey,
      });
    }

    return results;
  }

  async getAccessUrl(ossKey: string, expiresSeconds = 3600 * 24 * 7) {
    const publicBase = this.config.get<string>("OSS_PUBLIC_BASE");
    if (publicBase) {
      return `${publicBase.replace(/\/$/, "")}/${ossKey}`;
    }
    if (this.mockMode) {
      return `https://mock.local/${ossKey}`;
    }
    if (!this.client) {
      throw new ServiceUnavailableException("对象存储未配置");
    }
    return this.client.signatureUrl(ossKey, { expires: expiresSeconds });
  }

  /** 临时预览 URL，有效期较短 */
  async getTempPreviewUrl(ossKey: string) {
    return this.getAccessUrl(ossKey, 3600);
  }

  private assertTempKeyOwnedByUser(ossKey: string, userId: number) {
    const expectedPrefix = `temp/${userId}/`;
    if (!ossKey.startsWith(expectedPrefix)) {
      throw new ForbiddenException("无权操作该文件");
    }
  }

  private resolveExtension(mimeType: string) {
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    return "jpg";
  }

  private extractExtension(key: string) {
    const ext = key.split(".").pop()?.toLowerCase();
    if (ext === "png" || ext === "webp" || ext === "jpg" || ext === "jpeg") {
      return ext === "jpeg" ? "jpg" : ext;
    }
    throw new NotFoundException(`无法识别文件类型: ${key}`);
  }
}
