## Why

工作坊需要一款可多人共用的麻将计分工具：现场常有一人代记或多人轮流补分，现有工具要么纯本地、要么像猜数字那样角色权限对立，无法支撑「全员可改分、可邀请、结束后归档」的共享牌局体验。

## What Changes

- 新增「麻将计分」工具：入口页（新建牌局 + 参与过的历史）与牌局页（四人座位、记账、邀请、结束）
- 新增服务端牌局会话：创建 / 加入 / 结束；参与者对等权限（创建者星标仅展示，不限制操作）
- 计分草稿：每局最多一份进行中草稿（四席可为 null）；保存允许部分分数；四人都填齐后自动转正为历史轮
- 历史轮编辑：仅活跃局内可改；改历史必须四人都有分且通过总和校验（sum == 0）；结束后只读
- 结束牌局：任一参与者可结束（二次确认）；结束时丢弃未完成草稿
- 同步：客户端轮询 + 页面 `show` 时拉取一次最新状态
- 邀请：微信分享 path 带会话标识；官方小程序码（`getwxacodeunlimit` + 短 scene）扫码进房
- 工具注册：seed、小程序路由、fallback 列表与图标

## Capabilities

### New Capabilities

- `mahjong-score-sessions`: 牌局会话生命周期、参与者对等权限、加入/结束、历史列表（参与过的）
- `mahjong-score-rounds`: 草稿分、自动转正、历史轮编辑与总和校验、结束后锁定
- `mahjong-score-invite`: 微信分享进房与官方小程序码生成/扫码解析

### Modified Capabilities

- （无）现有 `guess-number-game-sessions` 需求不变；麻将为独立领域模块

## Impact

- **API**：新建 NestJS 模块（如 `mahjong`）、Prisma 模型（会话 / 参与者 / 草稿或轮次 / 短码）、微信 `access_token` + 小程序码接口（复用 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`）
- **Mini**：新页面 `mahjongScore`（入口 + 牌局子页或同包多页）、轮询与 `useDidShow` 同步、分享与小程序码展示
- **Shared**：新增会话/轮次 API 类型
- **依赖**：无新基础设施（不做 WebSocket）；轮询即可
- **配置**：确认小程序码对应页面 path 已注册；`scene` 短码映射表
