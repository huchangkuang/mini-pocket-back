## Why

Taro 3.6.20 已发布 3 年，存在安全风险和功能缺失。taro-ui 维护停滞，与 Taro 4 兼容性未验证。升级到 Taro 4.2.0 并迁移到 NutUI 可获得官方支持、性能提升和长期维护保障。

## What Changes

- **BREAKING**: 升级 Taro 3.6.20 → 4.2.0（跨大版本，有 breaking changes）
- **BREAKING**: 移除 taro-ui 3.1.0-beta.6，替换为 @nutui/nutui-react-taro 3.0.20
- **BREAKING**: 移除所有 taro-ui 组件导入（AtIcon、AtButton、AtSlider、AtSwitch）
- 新增 @nutui/icons-react-taro 3.0.20 作为图标库
- 新增 babel-plugin-import 实现按需加载
- 更新 babel.config.js 配置
- 移除未使用的平台插件（alipay、h5、jd、qq、swan、tt），仅保留 weapp
- 移除 taro-ui 样式导入，改用 NutUI 按需加载样式

## Capabilities

### New Capabilities

- `nutui-components`: 使用 NutUI React Taro 组件库替代 taro-ui，包括 Button、Switch、Range 等组件
- `nutui-icons`: 使用 @nutui/icons-react-taro 替代 taro-ui 的 AtIcon，提供 29 种图标的映射

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **依赖**: 移除 taro-ui，新增 @nutui/nutui-react-taro、@nutui/icons-react-taro、babel-plugin-import
- **代码**: 约 25 个文件需要修改（主要是组件导入和样式）
- **配置**: babel.config.js、config/index.js、package.json
- **样式**: 需要微调部分 CSS 以适配 NutUI 视觉风格
- **构建**: 配置 babel-plugin-import 实现按需加载
