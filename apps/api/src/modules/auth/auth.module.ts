import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import { StatsModule } from "../stats/stats.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { WechatService } from "./wechat.service";

@Module({
  imports: [
    forwardRef(() => StatsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "change-me-in-production"),
        signOptions: {
          expiresIn: configService.get("JWT_EXPIRES_IN", "7d"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, WechatService, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [AuthService, WechatService, JwtModule, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}
