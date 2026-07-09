## Why

前端猜数字游戏正在从单机模式升级为分享对战模式。出题者锁定目标数字后创建游戏会话，通过微信分享携带 `gameId` 发给好友，好友打开后提交猜测由服务端计算 A/B 结果。需要在后端新增游戏会话管理能力，包括创建游戏、获取游戏信息、提交猜测三个 API。

## What Changes

- 新增 Prisma 模型 `Game` 和 `GameGuess`，分别存储游戏会话和猜测记录
- 新增 NestJS 模块 `games`，含 controller、service、dto
- 新增 `POST /games` 端点——创建游戏（出题者调用）
- 新增 `GET /games/:gameId` 端点——获取游戏信息（猜题者调用，不返回目标数字）
- 新增 `POST /games/:gameId/guess` 端点——提交猜测（猜题者调用，服务端计算 A/B）
- A/B 计算逻辑实现 Bulls and Cows 算法，支持重复数字
- 目标数字哈希存储（bcrypt），避免明文泄露
- 出题人自猜拦截（403）
- 同 gameId 多人独立猜测（按 userId 隔离）

## Capabilities

### New Capabilities

- `guess-number-game-sessions`: 猜数字游戏会话管理——游戏创建、信息查询、猜测提交、A/B 计算、多人独立猜测。涵盖数据库模型、API 端点、业务逻辑。

### Modified Capabilities

<!-- 此次为全新模块，不修改现有能力 -->

## Impact

- **数据库**: 新增 `games` 和 `game_guesses` 两张表，Prisma migration
- **新增模块**: `apps/api/src/modules/games/`（controller + service + dto + module）
- **注册模块**: `apps/api/src/app.module.ts` 中注册 `GamesModule`
- **无影响**: 不影响现有 auth、tools、favorites 等模块
