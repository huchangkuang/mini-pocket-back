import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AuthService } from "../../modules/auth/auth.service";
import { AuthUser, JwtPayload } from "../types/auth-user";
import { extractBearerToken } from "../utils/token.util";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    request.user = await this.resolveUser(request);
    return true;
  }

  private async resolveUser(request: Request): Promise<AuthUser> {
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException("请先登录");
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.authService.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("登录已失效，请重新登录");
      }
      return user;
    } catch {
      throw new UnauthorizedException("登录已失效，请重新登录");
    }
  }
}
