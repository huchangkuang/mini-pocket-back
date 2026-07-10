# 简易口袋能力台账（基线）

## 1. 页面清单与入口映射

### 1.1 主包页面（`src/app.config.ts`）

| 页面路径                         | 页面名称             | 入口来源                           | 状态               |
| -------------------------------- | -------------------- | ---------------------------------- | ------------------ |
| `pages/classify/index`           | 分类首页             | 默认首页                           | 已启用             |
| `pages/handsBarrage/index`       | 手持弹幕展示         | `handsBarrage/edit` 提交参数后跳转 | 已启用             |
| `pages/handsBarrage/edit/index`  | 手持弹幕配置         | 分类页功能入口                     | 已启用             |
| `pages/doDescription/index`      | 做个决定             | 分类页功能入口                     | 已启用             |
| `pages/doDescription/edit/index` | 做个决定编辑         | 决策页内跳转                       | 已启用             |
| `pages/fingerUp/index`           | 指尖轮盘             | 分类页功能入口                     | 已启用             |
| `pages/qrcode/index`             | 二维码生成           | 分类页功能入口                     | 已启用             |
| `pages/metronome/index`          | 节拍器               | 分类页功能入口                     | 已启用             |
| `pages/lottery/index`            | 随机数（双色球样式） | 页面注册但分类页隐藏               | 已启用（入口隐藏） |
| `pages/returnClock/index`        | 反方向的钟           | 分类页功能入口                     | 已启用             |
| `pages/guessNumber/index`        | 猜数字（4A2B）       | 分类页功能入口                     | 已启用             |

### 1.2 分包页面

| 分包根目录      | 页面    | 功能                      |
| --------------- | ------- | ------------------------- |
| `pages/beadArt` | `index` | 拼豆图片生成与 Excel 导出 |

### 1.3 分类入口映射（`src/pages/classify/constants.ts`）

| 分类文案     | 跳转路径                         | 备注                              |
| ------------ | -------------------------------- | --------------------------------- |
| 手持弹幕     | `/pages/handsBarrage/edit/index` | 启用                              |
| 做个决定吧   | `/pages/doDescription/index`     | 启用                              |
| 指尖轮盘     | `/pages/fingerUp/index`          | 启用                              |
| 二维码生成   | `/pages/qrcode/index`            | 启用                              |
| 节拍器       | `/pages/metronome/index`         | 启用                              |
| 随机数       | `/pages/lottery/index`           | 在 `excludeClassifyList` 中被隐藏 |
| 反方向的钟   | `/pages/returnClock/index`       | 启用                              |
| 拼豆图片生成 | `/pages/beadArt/index`           | 启用（分包）                      |
| 猜数字       | `/pages/guessNumber/index`       | 启用                              |

## 2. 复用模块与职责边界

### 2.1 组件层（`src/components/**`）

- `bomFixed`：底部固定按钮容器，统一底部操作区布局。
- `navBar`：顶部导航样式组件（局部页面可选）。
- `triangle`：方向三角形渲染，用于指针/提示视觉元素。

### 2.2 Hooks（`src/hooks/**`）

- `useThrottle`：节流执行，避免高频点击/触发。
- `useDebounce`：防抖执行，减少短时间重复触发。

### 2.3 工具层（`src/utils/**`）

- 交互反馈：`errorToast.ts`。
- 随机与 ID：`generateNum.ts`、`idGenerator.ts`。
- 平台能力：`wechatApi.ts`（支付、授权、Canvas 保存相册）。
- 解析与常量：`parseQuery.ts`、`constant.ts`、`type.ts`。
- 编码能力：`utils/code/*`（二维码、条形码编码绘制）。

## 3. 构建配置与关键依赖

### 3.1 构建配置（`config/**`）

- Taro Webpack5 编译链路，`framework: react`，`sourceRoot: src`，`outputRoot: dist`。
- 已配置 `@` 指向 `src`，用于跨目录导入。
- `mini` 与 `h5` 均启用 PostCSS 能力；`h5` 开发态配置 `esnextModules: ['taro-ui']`。

### 3.2 关键依赖（`package.json`）

- 核心框架：`@tarojs/* 3.6.20`、`react 18`、`typescript`。
- UI：`taro-ui`。
- 业务库：`dayjs`（时间）、`exceljs`（Excel 导出）、`classnames`。

### 3.3 平台能力调用热点

- Canvas 与图片保存：二维码页、拼豆页（`Canvas` + 文件系统/相册保存）。
- 多媒体：节拍器页（`createInnerAudioContext`）。
- 分享：多个页面使用 `useShareAppMessage`。
- 导航与路由参数：分类页跳转、手持弹幕编辑到展示页参数传递。
- 更新机制：`src/app.ts` 使用 `getUpdateManager`。

## 4. 当前可见问题（用于后续迭代）

- 分类配置中“随机数”能力被隐藏，但页面仍存在，功能对外入口策略需统一。
- `pages/mine/*` 文件存在但未在 `app.config.ts` 注册，属于候选/遗留模块。
- 测试覆盖较少（目前仅见 `utils/generateNum` 单测），多数页面依赖手工回归。
