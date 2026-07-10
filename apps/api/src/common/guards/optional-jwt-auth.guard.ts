import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AuthService } from "../../modules/auth/auth.service";
import { AuthUser, JwtPayload } from "../types/auth-user";
import { extractBearerToken } from "../utils/token.util";

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = extractBearerToken(request);
    if (!token) {
      return true;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.authService.findUserById(payload.sub);
      if (user) {
        request.user = user;
      }
    } catch {
      // ignore invalid token for optional auth
    }

    return true;
  }
}
