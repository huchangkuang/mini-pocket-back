## ADDED Requirements

### Requirement: shared 包提供 ApiResponse 通用类型

`@mini-pocket/shared` SHALL 导出 `ApiResponse<T>` 接口，结构为 `{ code: number; message: string; data: T }`，与后端 `common/types/api-response.ts` 和前端 `types/api.ts` 中的定义一致。

#### Scenario: 前端从 shared 导入 ApiResponse

- **WHEN** 前端代码 `import type { ApiResponse } from "@mini-pocket/shared"`
- **THEN** 类型结构与原有 `@/types/api.ts` 中的 `ApiResponse` 完全一致，现有使用处无需修改

#### Scenario: 后端从 shared 导入 ApiResponse

- **WHEN** 后端代码 `import type { ApiResponse } from "@mini-pocket/shared"`
- **THEN** 类型结构与原有 `common/types/api-response.ts` 中的 `ApiResponse` 完全一致

### Requirement: shared 包导出工具和分类相关类型

`@mini-pocket/shared` SHALL 导出以下类型：`Accent`（枚举 union）、`Category`、`Tool`、`ApiToolsList`、`ListToolsQuery`。字段定义 SHALL 与前端 `types/api.ts` 中对应类型完全一致。

#### Scenario: Tool 类型覆盖前端现有字段

- **WHEN** 前端使用 `Tool` 类型访问 `id`、`routePath`、`name`、`description`、`iconKey`、`accent`、`category`、`heat`、`heatScore`、`isFavorite` 字段
- **THEN** 所有字段类型与现有 `ApiTool` 一致，TypeScript 编译通过

#### Scenario: 后端 mapper 返回值匹配 Tool 类型

- **WHEN** 后端 `tool.mapper.ts` 的 `mapTool()` 函数返回值赋值给 `Tool` 类型变量
- **THEN** TypeScript 编译通过，无类型不匹配错误

### Requirement: shared 包导出收藏相关类型

`@mini-pocket/shared` SHALL 导出 `ApiFavorite`、`ApiFavoritesList`、`ApiToggleFavoriteResult`、`ListFavoritesQuery` 类型。

#### Scenario: 前端收藏服务使用 shared 类型

- **WHEN** 前端 `services/favoritesApi.ts` 从 `@/types/api` 导入收藏相关类型
- **THEN** 类型来源变为 `@mini-pocket/shared` 的 re-export，API 返回值类型检查通过

### Requirement: shared 包导出用户和认证相关类型

`@mini-pocket/shared` SHALL 导出 `ApiUserProfile`、`ApiLoginResult`、`ApiUserStats`、`ApiUserLevel`、`ApiLevelConfig`、`ApiUserMe`、`ApiRecordActiveDayResult`、`ApiRecordToolUseResult` 类型。

#### Scenario: 用户信息类型一致性

- **WHEN** 后端 auth/stats 模块返回用户数据，前端通过 shared 类型接收
- **THEN** 字段名和类型完全匹配，无运行时类型漂移风险

### Requirement: shared 包导出决策、反馈、存储、游戏相关类型

`@mini-pocket/shared` SHALL 导出决策相关类型（`ApiDecision`、`ApiDecisionSummary`、`ApiDecisionsList`）、反馈相关类型（`FeedbackType`、`ApiSubmitFeedbackResult`）、存储相关类型（`ApiUploadResult`、`ApiPersistedFile`、`ApiPersistStorageResult`、`PersistScope`）、游戏相关类型（`ApiCreateGameResult`、`ApiGuessRecord`、`ApiGameInfo`、`ApiGameGuessResult`）。

#### Scenario: 游戏类型覆盖猜数字对战功能

- **WHEN** 前端 `services/gamesApi.ts` 使用 `ApiGameInfo` 类型接收游戏状态
- **THEN** `gameId`、`creator`、`status`、`myHistory`、`isCreator` 字段类型与现有定义一致

### Requirement: shared 包零运行时依赖

`@mini-pocket/shared` 的 `package.json` SHALL NOT 声明任何 `dependencies`，仅包含 TypeScript 类型导出（`.ts` 文件），无运行时 JavaScript 代码。

#### Scenario: 安装 shared 包不引入额外依赖

- **WHEN** 在 monorepo 根目录执行 `pnpm install`
- **THEN** `packages/shared` 不引入任何额外的 node_modules 依赖

### Requirement: shared 包通过 workspace 协议被引用

`apps/api` 和 `apps/mini` 的 `package.json` SHALL 通过 `"@mini-pocket/shared": "workspace:*"` 声明对 shared 包的依赖。

#### Scenario: pnpm workspace 解析 shared 包

- **WHEN** 前端或后端代码 `import type { ... } from "@mini-pocket/shared"`
- **THEN** pnpm 将其解析为 `packages/shared` 的本地包，TypeScript 编译通过
