## Why

前端项目 `mini-pocket`（Taro 小程序）和后端项目 `mini-pocket-back`（NestJS API）目前分开管理，导致：

- API 类型定义手动同步，改了一端另一端不报错，运行时才暴露问题
- 开发体验不统一（两套包管理、两套 lint 规则）
- 无法利用 pnpm workspace 做跨项目类型共享和依赖复用

将前端合并为 monorepo 的 `apps/mini`，并抽取共享类型包 `packages/shared`，可以从根本上解决类型漂移问题，统一开发工具链。

## What Changes

- 将 `../mini-pocket` 整体迁移为 `apps/mini/`，保持 Taro 3.6.20 + React 18 技术栈不变
- 包管理从 yarn 切换到 pnpm，纳入 workspace 管理
- 新建 `packages/shared`（`@mini-pocket/shared`），抽取前后端共用的 API 契约类型
- 前端 `src/types/api.ts` 改为从 `@mini-pocket/shared` re-export + 保留前端特有类型
- 后端 mapper/DTO 的返回类型改为从 `@mini-pocket/shared` 导入，显式标注
- 根级统一 ESLint、Prettier、EditorConfig 配置
- 合并两边的 `.gitignore`
- 根 `package.json` 补充前端相关 scripts（`dev:mini`、`build:mini` 等）

## Capabilities

### New Capabilities

- `shared-types`: `packages/shared` 包，定义前后端共用的 API 契约类型（ApiResponse、Tool、Category、User、Game 等），前后端都从此包导入

### Modified Capabilities

<!-- 无已有 spec 的需求变更 -->

## Impact

- **代码结构**: 新增 `apps/mini/`、`packages/shared/`，根级配置文件变更
- **依赖**: 前端从 yarn 迁移到 pnpm；后端 `apps/api` 新增对 `@mini-pocket/shared` 的 workspace 依赖
- **类型系统**: 后端 mapper 返回类型从隐式推导改为显式 `@mini-pocket/shared` 导入；前端 api.ts 改为 re-export
- **CI/部署**: 后端部署流程不变；前端小程序构建命令路径变化（从根目录变为 `apps/mini/`）
- **开发环境**: 开发者需要重新 `pnpm install`，前端不再单独 `yarn install`
