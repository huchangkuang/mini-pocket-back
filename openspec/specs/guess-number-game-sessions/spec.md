## ADDED Requirements

### Requirement: 创建游戏会话 API

系统 SHALL 提供 `POST /games` 端点，需要 JWT 认证。请求体 MUST 包含 `targetNumber` 字段（四位数字字符串）。服务端 MUST 加密存储目标数字，MUST 创建 Game 数据库记录，MUST 返回 `gameId`。

#### Scenario: 成功创建游戏

- **WHEN** 已认证用户提交 `{ "targetNumber": "1234" }` 到 `POST /games`
- **THEN** 系统 MUST 返回 HTTP 201，body 包含 `{ "gameId": "<cuid>", "createdAt": "<ISO8601>", "status": "waiting" }`

#### Scenario: 目标数字不合法

- **WHEN** 用户提交 `{ "targetNumber": "12a4" }` 或 `{ "targetNumber": "12" }` 或 `{ "targetNumber": "12345" }`
- **THEN** 系统 MUST 返回 HTTP 400，body 包含错误信息

#### Scenario: 未认证用户

- **WHEN** 无 JWT token 的请求访问 `POST /games`
- **THEN** 系统 MUST 返回 HTTP 401

### Requirement: 获取游戏信息 API

系统 SHALL 提供 `GET /games/:gameId` 端点，需要 JWT 认证。响应 MUST 包含游戏元信息和当前用户的猜测历史，MUST NOT 包含目标数字原文或密文。响应 MUST 包含 `isCreator` 字段指示请求者是否为出题人。

#### Scenario: 猜题者获取游戏信息

- **WHEN** 非出题人请求 `GET /games/:gameId` 且游戏存在
- **THEN** 系统 MUST 返回 `{ "gameId", "creator": { "nickname", "avatarUrl" }, "status", "myHistory": [...], "isCreator": false }`，MUST NOT 包含目标数字相关信息

#### Scenario: 出题人获取自己创建的游戏

- **WHEN** 出题人请求自己创建的 `GET /games/:gameId`
- **THEN** 系统 MUST 返回 `"isCreator": true`

#### Scenario: 游戏不存在

- **WHEN** 请求 `GET /games/:nonExistentId`
- **THEN** 系统 MUST 返回 HTTP 404

### Requirement: 提交猜测 API

系统 SHALL 提供 `POST /games/:gameId/guess` 端点，需要 JWT 认证。请求体 MUST 包含 `guess` 字段（四位数字字符串）。服务端 MUST 解密目标数字，计算 A/B 结果，MUST 持久化猜测记录，MUST 返回结果和历史。

#### Scenario: 成功提交猜测

- **WHEN** 猜题者提交 `{ "guess": "1243" }` 且目标数字为 `1234`
- **THEN** 系统 MUST 返回 `{ "result": "2A2B", "attemptNumber": N, "won": false, "history": [...] }`

#### Scenario: 猜中目标数字

- **WHEN** 猜题者提交 `{ "guess": "1234" }` 且 guess 与目标数字完全相同
- **THEN** 系统 MUST 返回 `{ "result": "4A0B", "attemptNumber": N, "won": true, "history": [...] }`，Game 状态 MUST 更新为 `won`

#### Scenario: 出题人自猜

- **WHEN** 出题人提交猜测到自己的游戏
- **THEN** 系统 MUST 返回 HTTP 403，body 包含 `{ "message": "不能猜自己出的题" }`

#### Scenario: 猜对后再次提交

- **WHEN** 猜题者已经猜对（history 中含 4A0B），再次提交猜测
- **THEN** 系统 MUST 返回 HTTP 400，body 包含 `{ "message": "你已经猜对了！" }`

#### Scenario: 猜测数字不合法

- **WHEN** 用户提交 `{ "guess": "abc" }` 或非四位数字
- **THEN** 系统 MUST 返回 HTTP 400

#### Scenario: 游戏不存在

- **WHEN** 提交猜测到不存在的 `gameId`
- **THEN** 系统 MUST 返回 HTTP 404

### Requirement: A/B 计算逻辑

系统 SHALL 实现 Bulls and Cows 算法计算猜测结果。第一遍扫描 MUST 标记位置和数字均匹配的位（A），第二遍扫描 MUST 在剩余未匹配位中查找数字匹配（B）。系统 MUST 正确处理目标数字含重复数字的情况。

#### Scenario: 目标含重复数字的计算

- **WHEN** 目标为 `1122`，猜测为 `1212`
- **THEN** 计算结果 MUST 为 `2A2B`

#### Scenario: 完全匹配

- **WHEN** 目标为 `1234`，猜测为 `1234`
- **THEN** 计算结果 MUST 为 `4A0B`

#### Scenario: 完全无匹配

- **WHEN** 目标为 `1234`，猜测为 `5678`
- **THEN** 计算结果 MUST 为 `0A0B`

### Requirement: 目标数字加密存储

系统 SHALL 使用对称加密（AES-256-GCM）存储目标数字。加密密钥 MUST 从环境变量读取，MUST NOT 硬编码在代码中。

#### Scenario: 创建时加密

- **WHEN** `POST /games` 创建游戏时
- **THEN** 目标数字 MUST 以 AES-256-GCM 加密后存入 `target_hash` 字段，MUST NOT 以明文存储

#### Scenario: 验证时解密

- **WHEN** `POST /games/:gameId/guess` 需要计算 A/B 结果时
- **THEN** 系统 MUST 解密 `target_hash` 获取原文进行比对

### Requirement: 多人独立猜测

系统 SHALL 允许多个不同用户对同一 `gameId` 各自独立猜测。每个用户的猜测记录 MUST 按 `userId` 隔离存储和查询。一个用户猜对后 MUST NOT 影响其他用户的猜测。

#### Scenario: 多人各自猜

- **WHEN** 用户 A 和用户 B 分别提交猜测到同一 `gameId`
- **THEN** 用户 A 的猜测次数和历史 MUST 独立于用户 B，各自 `attemptNumber` MUST 从 1 开始递增

#### Scenario: 一人猜对不影响他人

- **WHEN** 用户 A 猜对后，用户 B 提交猜测
- **THEN** 系统 MUST 允许用户 B 继续猜测，MUST NOT 因 `Game.status === "won"` 拒绝用户 B

### Requirement: 数据库模型

系统 SHALL 新增 `games` 和 `game_guesses` 两张 Prisma 模型表。`games` MUST 包含 `id`（cuid）、`creatorId`（外键 users）、`targetHash`、`status`（枚举：waiting/won）、`createdAt`。`game_guesses` MUST 包含 `id`（自增）、`gameId`（外键 games）、`userId`（外键 users）、`guess`、`result`、`attemptNumber`、`createdAt`，并 MUST 对 `(gameId, userId, attemptNumber)` 设唯一约束。

#### Scenario: Game 表创建

- **WHEN** 运行 Prisma migration
- **THEN** 数据库 MUST 包含 `games` 表，字段包括 `id`、`creator_id`、`target_hash`、`status`、`created_at`

#### Scenario: GameGuess 表创建

- **WHEN** 运行 Prisma migration
- **THEN** 数据库 MUST 包含 `game_guesses` 表，字段包括 `id`、`game_id`、`user_id`、`guess`、`result`、`attempt_number`、`created_at`，复合唯一约束 `(game_id, user_id, attempt_number)`
