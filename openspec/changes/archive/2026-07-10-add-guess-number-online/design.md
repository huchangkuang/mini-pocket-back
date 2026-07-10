## Context

当前后端是 NestJS + Prisma + MySQL 架构，已有 auth、tools、favorites、stats 等模块。前端猜数字游戏从单机升级为分享对战模式，需要服务端提供游戏会话管理。这是第一次引入"游戏会话"概念，需要设计新的数据库模型和 API 模式。

## Goals / Non-Goals

**Goals:**

- 出题者创建游戏会话（存储目标数字哈希）
- 猜题者获取游戏信息（不返回目标数字）
- 猜题者提交猜测，服务端计算 A/B 结果
- 多人独立猜测（按 userId 隔离）
- 出题人自猜拦截（403）
- 猜对后禁止再猜（400）

**Non-Goals:**

- 不做游戏列表查询
- 不做实时通知（WebSocket/SSE）
- 不做游戏过期自动清理（第一版不过期）
- 不做胜率统计 / 排行榜

## Decisions

### D1: 数据库模型设计

两张新表，与现有 `users` 表关联：

```prisma
model Game {
  id            String       @id @default(cuid())
  creatorId     Int          @map("creator_id")
  creator       User         @relation(fields: [creatorId], references: [id])
  targetHash    String       @map("target_hash")  // bcrypt(targetNumber)
  status        GameStatus   @default(waiting)     // waiting | won (全局状态，暂不强制)
  createdAt     DateTime     @default(now()) @map("created_at")
  guesses       GameGuess[]

  @@map("games")
}

model GameGuess {
  id            Int      @id @default(autoincrement())
  gameId        String   @map("game_id")
  game          Game     @relation(fields: [gameId], references: [id])
  userId        Int      @map("user_id")
  user          User     @relation(fields: [userId], references: [id])
  guess         String   @db.VarChar(4)   // 四位数字
  result        String   @db.VarChar(4)   // "2A1B"
  attemptNumber Int      @map("attempt_number")
  createdAt     DateTime @default(now()) @map("created_at")

  @@unique([gameId, userId, attemptNumber])
  @@map("game_guesses")
}

enum GameStatus {
  waiting
  won
}
```

- `gameId` 用 cuid（短且随机，适合分享 URL）
- `targetHash` 存 bcrypt 哈希而非明文
- `GameGuess` 复合唯一约束防止同一用户同一次尝试重复提交

**Alternatives considered**:

- UUID v4 → 太长，分享 URL 不友好
- 明文存储目标数字 → 安全风险，运维人员或 DB 泄露会导致题目答案暴露
- 单表设计（Game 内嵌 JSON guesses）→ 不满足 Prisma 关系查询习惯，也不利于按用户查历史

### D2: A/B 计算——逐位比对

由于目标数字已哈希存储，无法解密后比对。改为**逐位比对哈希**：对目标数字的每一位单独 bcrypt，猜测时逐位比对。

但 bcrypt 每次结果不同（加盐），无法直接比对哈希值。两种可行方案：

**选择方案 B：加盐哈希后，猜题时也传入猜测，用 timing-safe 方式比对**

实际上最实用的做法是：**用 HMAC(key, targetNumber) 存储**，猜测时服务端重新计算 `HMAC(key, guess)` 是否等于存储的 `HMAC(key, targetNumber)`。但这只能判断整体相等（4A0B 场景），不能给出部分匹配（2A1B）。

**最终选择：使用对称加密而非哈希**。存储 `encrypt(targetNumber, serverSecret)`，服务端可以解密出目标数字进行 A/B 计算。密钥存储在环境变量中，仅服务端可访问。

比纯哈希更实用——A/B 计算需要原始数字，我们不信任客户端计算结果。

### D3: API 设计

遵循现有 NestJS 模块模式，JWT 认证守卫复用。

```
POST /games
├── Guard: JwtAuthGuard
├── Body: { targetNumber: string }  // 四位数字，"1234"
├── DTO: CreateGameDto (class-validator: @IsString, @Length(4,4), @Matches(/\d{4}/))
├── Service: 加密 targetNumber → 创建 Game 记录 → 返回 gameId
└── Response: 201 { gameId, createdAt, status: "waiting" }

GET /games/:gameId
├── Guard: JwtAuthGuard
├── Service: 查 Game + creator 信息 + 当前用户的猜测历史
├── Response: 200 { gameId, creator: { nickname, avatarUrl }, status, guessCount, myHistory, isCreator }
└── Note: 不返回 targetHash，不暴露目标数字

POST /games/:gameId/guess
├── Guard: JwtAuthGuard
├── Body: { guess: string }
├── DTO: SubmitGuessDto (class-validator: @IsString, @Length(4,4), @Matches(/\d{4}/))
├── Service:
│   1. 查 Game，验证存在
│   2. 校验 creatorId !== userId（否则 403）
│   3. 查当前用户历史，判断是否已猜对（否则 400）
│   4. 解密 targetNumber，计算 A/B
│   5. 创建 GameGuess 记录
│   6. 若 4A0B，更新 Game.status = "won"
│   7. 返回 result + history
└── Response: 200 { result, attemptNumber, won, history }
```

### D4: 目标数字加密方案

- 算法：AES-256-GCM，密钥从环境变量 `GAME_TARGET_SECRET` 读取
- 加密时机：`POST /games` 创建时
- 解密时机：`POST /games/:gameId/guess` 验证猜测时
- 密钥管理：部署时通过环境变量注入，不写入代码

### D5: 模块结构

```
apps/api/src/modules/games/
├── games.module.ts      // 注册 controller + service，导入 PrismaModule
├── games.controller.ts  // 3 个端点，使用 @CurrentUser() 和 JwtAuthGuard
├── games.service.ts     // 核心业务逻辑（A/B计算、加密解密）
├── dto/
│   ├── create-game.dto.ts
│   └── submit-guess.dto.ts
└── types.ts             // GameInfo, GuessResult 等响应类型
```

## Risks / Trade-offs

- **[风险] 加密密钥丢失** → 旧游戏数据无法验证。缓解：部署时固定密钥，密钥存在密钥管理服务（或环境变量备份）
- **[风险] 4 位数字加密可暴力破解** → 攻击者拿到数据库后可尝试 10000 种组合。缓解：数据库本身应受访问控制保护；后续可加 rate limiting；游戏非安全敏感场景，可接受
- **[权衡] 加密 vs 哈希** → 加密允许服务端计算 A/B 细粒度结果，但也意味着密钥泄露=所有题目暴露。游戏中数字的保密需求不高，加密优于哈希的实用性
