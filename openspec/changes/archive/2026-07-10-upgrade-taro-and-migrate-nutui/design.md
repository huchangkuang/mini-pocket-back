## Context

当前项目使用 Taro 3.6.20 + taro-ui 3.1.0-beta.6，技术栈已落后 3 年。taro-ui 维护停滞，无法保证与 Taro 4 的兼容性。项目仅使用微信小程序平台，无需保留其他平台插件。

现有 taro-ui 使用情况：
- AtIcon: 24 处，29 种图标名
- AtButton: 5 处
- AtSlider: 1 处
- AtSwitch: 1 处

## Goals / Non-Goals

**Goals:**
- 升级 Taro 到最新稳定版 4.2.0
- 迁移到官方推荐的 NutUI React Taro 组件库
- 配置按需加载优化构建体积
- 移除未使用的平台插件简化项目

**Non-Goals:**
- 不迁移 H5 端（暂时不需要）
- 不重构业务逻辑
- 不修改页面视觉设计（仅替换底层组件）

## Decisions

### 1. 选择 NutUI React Taro 而非原生组件

**决定**: 使用 @nutui/nutui-react-taro 3.0.20

**理由**:
- taro-ui 的 AtIcon 使用了 29 种图标，原生组件无替代方案
- NutUI 是 Taro 官方推荐的替代方案
- 提供完整的组件库和图标库，迁移成本可控

**替代方案**:
- 纯原生 @tarojs/components: 图标需要自建，工作量大
- 继续用 taro-ui: 维护停滞，Taro 4 兼容性未验证

### 2. 使用 babel-plugin-import 实现按需加载

**决定**: 配置 babel-plugin-import 自动导入组件样式

**理由**:
- NutUI 官方推荐的按需加载方式
- 避免全量引入样式，减小构建体积
- 与 Taro 的 babel 配置兼容

**替代方案**:
- 全量引入样式: 简单但体积大
- 手动引入每个组件样式: 繁琐易出错

### 3. 移除未使用的平台插件

**决定**: 仅保留 @tarojs/plugin-platform-weapp

**理由**:
- 项目仅使用微信小程序平台
- 减少依赖数量，简化构建
- 降低升级复杂度

## Risks / Trade-offs

- [样式差异] NutUI 与 taro-ui 视觉风格不同 → 需要微调 CSS 适配
- [streaming 图标] NutUI 无直接对应 → 选择替代图标 VolumeMax
- [圆形图标] close-circle、check-circle 等 → 使用基础图标 + 圆形样式
- [Range API] AtSlider 的 onChanging 与 NutUI Range 的 onChange 参数格式不同 → 需要适配

## Migration Plan

1. 升级 Taro 依赖到 4.2.0
2. 安装 NutUI 相关依赖
3. 配置 babel-plugin-import
4. 逐个替换组件（先 Icon，再 Button/Slider/Switch）
5. 移除 taro-ui 样式导入
6. 测试验证所有页面功能
