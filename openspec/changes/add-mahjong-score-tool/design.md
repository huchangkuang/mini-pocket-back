## Context

Pocket Workshop 是 pnpm monorepo：Taro 微信小程序（`apps/mini`）+ NestJS/Prisma（`apps/api`）+ 共享类型（`packages/shared`）。工具以 DB seed + 页面路由注册；唯一服务端协作先例是猜数字（`Game` + 分享 `gameId` + JWT REST），无 WebSocket。麻将计分需要共享会话、对等写权限、草稿轮与官方小程序码，属于新领域模块，可参考 `games` 的模块边界与分享进房模式，但不复用其 creator/guest 对立权限。

约束：复用现有微信凭证（`WECHAT_APP_ID` / `WECHAT_APP_SECRET`）；同步以轮询 + `useDidShow` 为准；UI 参考已提供的入口页 / 牌局页 / 记账弹窗稿（去掉自摸快捷）。

## Goals / Non-Goals

**Goals:**

- 提供可多人加入的麻将牌局：新建、邀请（分享 + 官方小程序码）、参与过的历史列表
- 全员可改分、可邀请、可结束；创建者仅视觉星标
- 每局一份草稿分（可部分为空）；四人齐则自动转正为历史轮
- 活跃局可改历史轮，且必须四人齐全 + sum == 0；结束后只读并丢弃草稿
- 客户端通过轮询与页面 show 保持分数一致

**Non-Goals:**

- 自摸 / 番种 / 规则引擎自动算分
- WebSocket / SSE 实时通道
- 旁观角色、复杂 RBAC、审计日志 UI
- 跨小程序/ App 的通用短链（仅官方小程序码 + 分享 path）
- 超过四人座位或可变人数牌型

## Decisions

### 1. 独立 `mahjong` 领域模块，不塞进 `games`

- **选择**：`apps/api/src/modules/mahjong/` + 独立 Prisma 模型
- **理由**：猜数字是「出题/猜测」对立模型；麻将是共享白板。混用 `Game` 表会污染语义与权限
- **备选**：扩展 `games` 加 `type=mahjong` → 拒绝，权限与数据结构差异过大

### 2. 数据模型：Session + Participant + Round(draft|committed) + InviteCode

```
MahjongSession
  id (cuid), code (展示用短号如 RM-8829), status(active|ended)
  createdByUserId, createdAt, endedAt?

MahjongParticipant
  sessionId, userId, seatIndex(0-3)?, nickname/avatar 快照
  joinedAt；唯一 (sessionId, userId)

MahjongRound
  sessionId, roundNo?, status(draft|committed)
  score0..score3 Int?   // null = 未填
  updatedByUserId, updatedAt, committedAt?
  约束：每个 session 最多一条 status=draft

MahjongInviteCode
  scene (≤32 字符短码, unique) → sessionId
  用于 getwxacodeunlimit 的 scene 参数
```

- **理由**：用 `Round.status=draft` 表达「当前局唯一草稿表」与产品描述一致；转正即改 status 并分配 `roundNo`，不必两套表
- **备选**：独立 `MahjongDraft` 1:1 session → 也可行；选 Round 统一便于「改历史」与草稿共用分数字段校验逻辑

### 3. 权限：参与者即 editor

- 任一 `MahjongParticipant` 可：保存草稿、改历史轮、邀请、结束
- `createdByUserId` 仅用于 UI 星标
- 非参与者读/写均 403（分享进房时先 join 再操作）
- **备选**：房主独占结束 → 产品已明确任一可结束 + 二次确认

### 4. 草稿保存与自动转正

- `PUT/PATCH` 草稿：允许 1–4 个座位有值，未填保持 `null`；至少一席非 null 才写入
- 保存后若四席均非 null → 事务内：`status=committed`、分配递增 `roundNo`、记录 `committedAt`；**不**在转正时强制 sum==0，但响应带 `balanced: boolean`，前端提示不平衡并可点进修改
- 转正后该 session 无 draft，直到下次「保存草稿」再创建新 draft 行
- **改历史**：仅 `status=committed` 且 session `active`；请求体必须四席都有整数且 `sum==0`，否则 400；不允许改回 null / 改回 draft

### 5. 结束会话

- `POST .../end`：二次确认在客户端；服务端将 `status=ended`，**删除或丢弃** draft 行；committed 轮保留只读
- 结束后所有写接口 400/403

### 6. 同步策略

- `GET session` 返回：元信息、参与者、累计分、draft（若有）、最近 committed 轮、`updatedAt`/`version`
- 客户端：进房与 `useDidShow` 立即拉；牌局页 active 时每 2–3s 轮询（可用 `If-None-Match` / `updatedAt` 比较减少渲染抖动）
- **备选**：WebSocket → Non-Goal

### 7. 进房与小程序码

- 分享：`/pages/mahjongScore/room/index?sessionId=` 或 `?scene=`（与码统一用短码亦可）
- 小程序码：后端 `getAccessToken` + `getwxacodeunlimit`；`scene` = `MahjongInviteCode.scene`；page 指向牌局或入口中转页，落地后解析 scene → sessionId → join
- 复用现有微信 env，无需新密钥；注意体验版/正式版 env 版本参数
- **备选**：普通 Canvas 二维码画 path → 扫码体验差，产品要求官方码

### 8. 前端信息架构

- 入口页：`pages/mahjongScore/index` — 新建、历史（参与过）、扫码入口
- 牌局页：`pages/mahjongScore/room/index` — 座位、Invite/QR、加轮弹窗（保存草稿）、历史轮、结束
- 记账弹窗：去掉自摸；主按钮「保存草稿」；四人齐由服务端转正后关闭并刷新
- 工具注册：`seed` + `app.config` + `classify/constants` + `iconMap`

### 9. 座位与展示名

- MVP：创建者占 seat 0；被邀请用户按加入顺序占空位；允许未满四人仍记账（座位可用占位昵称「座位 N」若尚未 join）
- 分数始终按 seatIndex 0–3 存储；未绑定用户的座位仍可被任何人填写分数（代记）
- **Open**：是否允许手动改座位显示名 —— MVP 用微信昵称，缺席座位显示「空位」即可

## Risks / Trade-offs

- **[轮询延迟 / 冲突]** 两人同时改同一草稿座位 → last-write-wins → Mitigation：响应返回最新 draft；UI 以服务端为准覆盖；必要时展示「已同步」轻提示
- **[小程序码 scene 长度]** cuid 超长 → Mitigation：短码表映射
- **[转正时 sum≠0]** 用户可能误记 → Mitigation：允许转正但前端强提示；改历史强制 sum==0 纠正
- **[结束误触]** 任一可结束 → Mitigation：客户端二次确认文案明确「结束后不可再改」
- **[access_token 缓存]** 频繁生成码触发微信限频 → Mitigation：服务端缓存 token；码图可按 session 缓存至结束
- **[历史列表膨胀]** → Mitigation：入口默认最近 N 条 + See All 分页（可二期）

## Migration Plan

1. Prisma migrate 增加 mahjong 相关表
2. 部署 API（含小程序码接口）并配置微信凭证（已有）
3. 发布小程序新页面；seed 启用工具
4. 回滚：禁用工具 `enabled=false`；表可保留不影响其他模块

## Open Questions

- 展示用 Session 短号（`RM-8829`）生成规则：随机数字 vs 自增
- 入口「扫码」是调起微信扫一扫，还是仅展示本局小程序码供他人扫
- 统计卡片（Total Sessions / Highest Score）是否计入「参与过」维度的聚合（MVP 可先做简单 count / max）
