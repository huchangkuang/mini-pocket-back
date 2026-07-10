import { Controller, Get } from "@nestjs/common";
import { LevelService } from "./level.service";

@Controller("levels")
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  /** 等级称号配置（公开） */
  @Get()
  async list() {
    const levels = await this.levelService.getLevelConfigs();
    return levels.map((item) => ({
      level: item.level,
      minXp: item.minXp,
      title: item.title,
    }));
  }
}
