import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MahjongController } from "./mahjong.controller";
import { MahjongService } from "./mahjong.service";

@Module({
  imports: [AuthModule],
  controllers: [MahjongController],
  providers: [MahjongService],
})
export class MahjongModule {}
