import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { DecisionsModule } from "./modules/decisions/decisions.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { HealthModule } from "./modules/health/health.module";
import { StorageModule } from "./modules/storage/storage.module";
import { LevelModule } from "./modules/level/level.module";
import { StatsModule } from "./modules/stats/stats.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { GamesModule } from "./modules/games/games.module";
import { MahjongModule } from "./modules/mahjong/mahjong.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    ToolsModule,
    FavoritesModule,
    FeedbackModule,
    DecisionsModule,
    StorageModule,
    StatsModule,
    LevelModule,
    GamesModule,
    MahjongModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
