import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type WechatSessionResponse = {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

type WechatTokenResponse = {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
};

@Injectable()
export class WechatService {
  private accessToken: string | null = null;
  private accessTokenExpiresAt = 0;

  constructor(private readonly configService: ConfigService) {}

  private getCredentials() {
    const appId = this.configService.get<string>("WECHAT_APP_ID");
    const appSecret = this.configService.get<string>("WECHAT_APP_SECRET");
    if (!appId || !appSecret) {
      throw new UnauthorizedException("微信登录未配置，请联系管理员");
    }
    return { appId, appSecret };
  }

  async code2Session(code: string) {
    const { appId, appSecret } = this.getCredentials();

    const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
    url.searchParams.set("appid", appId);
    url.searchParams.set("secret", appSecret);
    url.searchParams.set("js_code", code);
    url.searchParams.set("grant_type", "authorization_code");

    const response = await fetch(url);
    const data = (await response.json()) as WechatSessionResponse;

    if (data.errcode || !data.openid) {
      throw new UnauthorizedException(data.errmsg ?? "微信登录失败");
    }

    return {
      openid: data.openid,
      unionid: data.unionid,
      sessionKey: data.session_key,
    };
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (!forceRefresh && this.accessToken && now < this.accessTokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const { appId, appSecret } = this.getCredentials();
    const url = new URL("https://api.weixin.qq.com/cgi-bin/token");
    url.searchParams.set("grant_type", "client_credential");
    url.searchParams.set("appid", appId);
    url.searchParams.set("secret", appSecret);

    const response = await fetch(url);
    const data = (await response.json()) as WechatTokenResponse;

    if (data.errcode || !data.access_token) {
      throw new BadGatewayException(data.errmsg ?? "获取微信 access_token 失败");
    }

    this.accessToken = data.access_token;
    this.accessTokenExpiresAt = now + (data.expires_in ?? 7200) * 1000;
    return this.accessToken;
  }

  /**
   * 生成微信官方小程序码（unlimited）。
   * @returns PNG buffer
   */
  async getUnlimitedWxacode(params: {
    scene: string;
    page: string;
    envVersion?: "release" | "trial" | "develop";
  }): Promise<Buffer> {
    if (params.scene.length > 32) {
      throw new BadGatewayException("scene 长度不能超过 32");
    }

    const token = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${encodeURIComponent(token)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene: params.scene,
        page: params.page,
        check_path: false,
        env_version: params.envVersion ?? this.configService.get("WECHAT_WXACODE_ENV", "release"),
        width: 430,
      }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (contentType.includes("application/json")) {
      const err = JSON.parse(buffer.toString("utf8")) as { errcode?: number; errmsg?: string };
      // token 过期时刷新一次重试
      if (err.errcode === 40001 || err.errcode === 42001) {
        await this.getAccessToken(true);
        return this.getUnlimitedWxacode(params);
      }
      throw new BadGatewayException(err.errmsg ?? "生成小程序码失败");
    }

    return buffer;
  }
}
