import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type WechatSessionResponse = {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

@Injectable()
export class WechatService {
  constructor(private readonly configService: ConfigService) {}

  async code2Session(code: string) {
    const appId = this.configService.get<string>("WECHAT_APP_ID");
    const appSecret = this.configService.get<string>("WECHAT_APP_SECRET");

    if (!appId || !appSecret) {
      throw new UnauthorizedException("微信登录未配置，请联系管理员");
    }

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
}
