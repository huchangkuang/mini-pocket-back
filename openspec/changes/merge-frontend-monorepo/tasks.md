## 1. 迁移前端文件

- [x] 1.1 将 `../mini-pocket/` 中的 `src/`、`config/`、`types/`、`project.config.json`、`project.tt.json`、`mini.project.json`、`sitemap.json`、`babel.config.js`、`tsconfig.json`、`README.md` 复制到 `apps/mini/`
- [x] 1.2 将 `../mini-pocket/` 中的 `images/`、`audio/`、`docs/` 目录复制到 `apps/mini/`（如有）
- [x] 1.3 创建 `apps/mini/package.json`：基于原 `../mini-pocket/package.json`，修改 `"name"` 为 `"@mini-pocket/mini"`，删除 `husky` 和 `lint-staged` 配置段
- [x] 1.4 在 `apps/mini/` 下执行 `pnpm install`，验证依赖安装成功，处理可能的幽灵依赖报错

## 2. 创建 packages/shared

- [x] 2.1 创建 `packages/shared/package.json`（name: `@mini-pocket/shared`，无 dependencies，main/types 指向 src）
- [x] 2.2 创建 `packages/shared/tsconfig.json`（适合纯类型导出的配置）
- [x] 2.3 创建 `packages/shared/src/api-response.ts`，导出 `ApiResponse<T>` 接口
- [x] 2.4 创建 `packages/shared/src/tools.ts`，导出 `Accent`、`Category`、`Tool`、`ApiToolsList`、`ListToolsQuery`
- [x] 2.5 创建 `packages/shared/src/favorites.ts`，导出 `ApiFavorite`、`ApiFavoritesList`、`ApiToggleFavoriteResult`、`ListFavoritesQuery`
- [x] 2.6 创建 `packages/shared/src/auth.ts`，导出 `ApiUserProfile`、`ApiLoginResult`
- [x] 2.7 创建 `packages/shared/src/stats.ts`，导出 `ApiUserStats`、`ApiUserLevel`、`ApiLevelConfig`、`ApiUserMe`、`ApiRecordActiveDayResult`、`ApiRecordToolUseResult`
- [x] 2.8 创建 `packages/shared/src/decisions.ts`，导出 `ApiDecision`、`ApiDecisionSummary`、`ApiDecisionsList`
- [x] 2.9 创建 `packages/shared/src/feedback.ts`，导出 `FeedbackType`、`ApiSubmitFeedbackResult`
- [x] 2.10 创建 `packages/shared/src/storage.ts`，导出 `PersistScope`、`ApiUploadResult`、`ApiPersistedFile`、`ApiPersistStorageResult`
- [x] 2.11 创建 `packages/shared/src/games.ts`，导出 `ApiCreateGameResult`、`ApiGuessRecord`、`ApiGameInfo`、`ApiGameGuessResult`
- [x] 2.12 创建 `packages/shared/src/index.ts`，barrel export 所有类型

## 3. 前端接入 shared 包

- [x] 3.1 在 `apps/mini/package.json` 中添加 `"@mini-pocket/shared": "workspace:*"` 依赖
- [x] 3.2 改写 `apps/mini/src/types/api.ts`：从 `@mini-pocket/shared` re-export 共享类型，保留前端特有类型（如 `ApiUserMe` 组合类型）
- [x] 3.3 验证 `apps/mini/` 下 `tsc --noEmit` 编译通过（如原项目有此检查）

## 4. 后端接入 shared 包

- [x] 4.1 在 `apps/api/package.json` 中添加 `"@mini-pocket/shared": "workspace:*"` 依赖
- [x] 4.2 改写 `apps/api/src/modules/tools/tool.mapper.ts`：从 `@mini-pocket/shared` 导入 `Tool` 类型，`mapTool()` 返回值显式标注
- [x] 4.3 改写 `apps/api/src/modules/favorites/favorite.mapper.ts`：从 `@mini-pocket/shared` 导入 `ApiFavorite` 类型
- [x] 4.4 改写 `apps/api/src/modules/decisions/decision.mapper.ts`：从 `@mini-pocket/shared` 导入决策相关类型
- [x] 4.5 改写 `apps/api/src/common/types/api-response.ts`：从 `@mini-pocket/shared` re-export `ApiResponse`
- [x] 4.6 验证后端 `pnpm --filter @mini-pocket/api typecheck` 通过

## 5. 根级工具链统一

- [x] 5.1 在根目录创建 `.prettierrc`，统一格式配置
- [x] 5.2 在根目录创建 `.editorconfig`，统一编辑器行为
- [x] 5.3 合并 `.gitignore`：将前端特有的忽略项（`.temp/`、`.rn_temp/`、`.swc`、`project.private.config.json`）加入根级 `.gitignore`
- [x] 5.4 在根 `package.json` 中补充 scripts：`dev:mini`、`build:mini`、`lint`、`format`、`format:check`

## 6. 验证

- [x] 6.1 在 monorepo 根目录执行 `pnpm install`，确认 workspace 正确识别 `apps/mini` 和 `packages/shared`
- [x] 6.2 执行 `pnpm --filter @mini-pocket/api typecheck`，确认后端类型检查通过
- [x] 6.3 执行 `pnpm --filter @mini-pocket/mini dev:weapp`，确认 Taro dev server 能正常启动
- [x] 6.4 执行 `pnpm --filter @mini-pocket/api build`，确认后端构建正常
