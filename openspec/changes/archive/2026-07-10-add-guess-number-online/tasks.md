## 1. 数据库

- [x] 1.1 新增 Prisma 模型 `Game` 和 `GameGuess` 及 `GameStatus` 枚举到 `prisma/schema.prisma`
- [x] 1.2 生成并运行 Prisma migration

## 2. 加密工具

- [x] 2.1 实现 AES-256-GCM 加密/解密工具函数，密钥从环境变量 `GAME_TARGET_SECRET` 读取
- [x] 2.2 在 `.env` 和 `.env.example` 中添加 `GAME_TARGET_SECRET` 配置项

## 3. Games 模块

- [x] 3.1 创建 DTO：`CreateGameDto`（targetNumber 校验：长度 4、纯数字）、`SubmitGuessDto`（guess 校验：长度 4、纯数字）
- [x] 3.2 创建 `GamesService`：实现 `createGame`（加密+入库）、`getGameInfo`（查库+拼装响应）、`submitGuess`（解密+计算 A/B+入库+判断胜负）
- [x] 3.3 实现 A/B 计算函数（Bulls and Cows 算法，支持重复数字）
- [x] 3.4 创建 `GamesController`：三个端点（POST /games、GET /games/:gameId、POST /games/:gameId/guess），使用 `@CurrentUser()` 和 `JwtAuthGuard`
- [x] 3.5 创建 `GamesModule`，注册 controller 和 service

## 4. 集成

- [x] 4.1 在 `app.module.ts` 中注册 `GamesModule`
- [x] 4.2 验证各端点：创建游戏 → 猜题者获取信息 → 提交猜测（含 4A0B 全流程）
- [x] 4.3 验证异常路径：自猜 403、重复猜对 400、数字格式 400、未认证 401、不存在 404
