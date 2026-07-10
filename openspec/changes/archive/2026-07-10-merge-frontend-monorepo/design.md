## Context

当前项目结构：

- **后端** `mini-pocket-back/`：pnpm monorepo，`apps/api`（NestJS + Prisma），`packages/` 为空
- **前端** `../mini-pocket/`：独立 Taro 3.6.20 + React 18 项目，yarn 管理，18 个页面

前端 `src/types/api.ts` 定义了 ~30 个 API 响应类型，与后端 mapper 返回值手动同步。两边都没有统一的 ESLint/Prettier 配置。

合并后目标结构：

```
mini-pocket-back/
  apps/
    api/              @mini-pocket/api  (NestJS 后端，不变)
    mini/             @mini-pocket/mini (Taro 小程序，迁入)
  packages/
    shared/           @mini-pocket/shared (API 契约类型)
```

## Goals / Non-Goals

**Goals:**

- 前端作为 `apps/mini/` 在 monorepo 中正常运行（`pnpm dev:mini` 能启动 Taro dev server）
- `packages/shared` 包含前后端共用的 API 契约类型，两端都从此包导入
- 后端 mapper 返回类型显式标注为 shared 包的类型
- 根级统一 Prettier 格式规则
- 合并 `.gitignore`，覆盖前端特有忽略项

**Non-Goals:**

- 不升级 Taro 版本（保持 3.6.20，后续单独处理）
- 不升级 taro-ui（保持 3.1.0-beta.6）
- 不改动后端业务逻辑或 API 行为
- 不改动小程序平台配置（appid 等原样保留）
- 不抽取前端 components/hooks 到共享包
- 不配置 CI/CD pipeline（后续单独处理）

## Decisions

### D1: 目录命名 `apps/mini` 而非 `apps/taro`

**选择**: `apps/mini`

**理由**: `taro` 是技术栈名称，`mini` 是产品形态。与 `apps/api` 对称（一个客户端一个服务端），且如果未来 Taro 大版本升级或换框架，目录名不会尴尬。

**替代方案**: `apps/taro` — 更明确技术栈，但绑定框架名称。

### D2: 包管理统一到 pnpm

**选择**: 删除 `yarn.lock`，前端纳入 pnpm workspace

**理由**: 后端已有 `pnpm-workspace.yaml` 配置 `apps/*` 和 `packages/*`，前端搬进来后自动被 workspace 覆盖。`pnpm-workspace.yaml` 无需修改。

**风险**: taro-ui 3.1.0-beta.6 可能有幽灵依赖，pnpm 严格模式下会暴露。缓解：先 install 看报错，按需在 `apps/mini/package.json` 中补充显式依赖。

### D3: shared 包只放 API 契约类型

**选择**: `packages/shared` 只包含 API 请求/响应的 TypeScript 类型定义，不包含运行时代码

**理由**:

- 前后端运行环境完全不同（浏览器小程序 vs Node.js），运行时代码无法共享
- API 契约类型是唯一真正需要同步的部分
- 保持包极简，零依赖，只有 `.ts` 类型导出

**包结构**:

```
packages/shared/
  src/
    api-response.ts    ApiResponse<T>
    tools.ts           Tool, Category, Accent, ListToolsQuery, ...
    favorites.ts       Favorite, ToggleFavoriteResult, ...
    decisions.ts       Decision, DecisionSummary, ...
    feedback.ts        FeedbackType, SubmitFeedbackResult, ...
    auth.ts            LoginResult, UserProfile, ...
    stats.ts           UserStats, UserLevel, LevelConfig, ...
    games.ts           GameInfo, GuessRecord, GameStatus, ...
    storage.ts         UploadResult, PersistedFile, ...
    index.ts           barrel export
  package.json
  tsconfig.json
```

### D4: 后端 mapper 返回类型改为显式导入

**选择**: 后端 `tool.mapper.ts`、`favorite.mapper.ts`、`decision.mapper.ts` 等的返回类型从 `@mini-pocket/shared` 导入

**示例**:

```typescript
// 之前：返回类型隐式推导
export function mapTool(tool: ToolWithCategory, options?) { ... }

// 之后：显式标注
import type { Tool } from '@mini-pocket/shared';
export function mapTool(tool: ToolWithCategory, options?): Tool { ... }
```

**理由**: 确保后端返回值和前端期望的类型在同一处定义，改了一端另一端编译报错。

### D5: 前端 api.ts 改为 re-export 模式

**选择**: `apps/mini/src/types/api.ts` 从 `@mini-pocket/shared` re-export 共享类型，保留前端特有的组合/UI 类型

```typescript
// 共享类型 — re-export
export type { ApiResponse, Tool, ListToolsQuery, ... } from "@mini-pocket/shared";

// 前端特有 — 保留
export type ApiUserMe = ApiUserProfile & { stats: ApiUserStats; level: ApiUserLevel };
```

**理由**: 最小化前端代码改动。已有的 import 路径 `@/types/api` 不需要变，只是底层来源从手写变成了 shared 包。

### D6: tsconfig 不继承，各自独立

**选择**: `apps/mini/tsconfig.json` 不 extends 根级 `tsconfig.base.json`，保持独立配置

**理由**:

- 前端 TS 配置和后端差异太大（target ES2017 vs ES2022，module commonjs vs NodeNext，jsx react-jsx，jsxFactory Taro.createElement）
- 强行继承会导致大量 override，不如各自清晰
- `packages/shared/tsconfig.json` 需要新建一个适合纯类型导出的配置

### D7: 根级 Prettier 统一格式

**选择**: 在根目录新增 `.prettierrc`，前后端共用

**配置建议**（对齐前端现有风格）:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

前端和后端的 `package.json` 中各自的 prettier 相关配置移除，统一使用根级配置。

## Risks / Trade-offs

| 风险                                                             | 缓解                                                                   |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| taro-ui 幽灵依赖在 pnpm 严格模式下报错                           | install 后按需补显式依赖                                               |
| Taro 3.6.20 的 webpack5 构建在 monorepo 路径下可能有路径解析问题 | 迁移后立即验证 `dev:weapp` 能否正常启动                                |
| shared 包类型变更需要重新编译两端                                | 后续可通过 `tsc --build` 或 turbo 缓解，当前手动 rebuild 即可          |
| 前端 `@/` 路径别名在 monorepo 深层目录下可能解析异常             | Taro config 中 alias 路径改为绝对路径 `path.resolve(__dirname, 'src')` |
| 后端 Prisma 生成类型和 shared 包类型可能不同步                   | mapper 层作为转换桥，Prisma 类型 → shared 类型，有显式类型检查兜底     |
