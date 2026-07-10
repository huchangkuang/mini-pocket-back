## ADDED Requirements

### Requirement: 图标组件替代
系统 SHALL 使用 @nutui/icons-react-taro 的图标组件替代 taro-ui 的 AtIcon。

#### Scenario: 基础图标渲染
- **WHEN** 使用 `<Search size="18" color="#707783" />` 渲染图标
- **THEN** 显示搜索图标，大小为 18px，颜色为 #707783

#### Scenario: 图标属性传递
- **WHEN** 设置 size 和 color 属性
- **THEN** 图标 SHALL 按照指定大小和颜色渲染

### Requirement: 图标名称映射
系统 SHALL 提供 taro-ui 图标名到 NutUI 图标的完整映射。

#### Scenario: 常用图标映射
- **WHEN** 原代码使用 AtIcon value="search"
- **THEN** 替换为 Search 组件

#### Scenario: 方向图标映射
- **WHEN** 原代码使用 AtIcon value="chevron-right"
- **THEN** 替换为 ArrowRight 组件

#### Scenario: 状态图标映射
- **WHEN** 原代码使用 AtIcon value="heart-2"
- **THEN** 替换为 HeartFill 组件

#### Scenario: 无直接对应图标
- **WHEN** 原代码使用 AtIcon value="streaming"
- **THEN** 替换为 VolumeMax 组件（替代方案）

### Requirement: 圆形图标样式
系统 SHALL 为 close-circle、check-circle 等图标提供圆形样式。

#### Scenario: 圆形关闭图标
- **WHEN** 原代码使用 AtIcon value="close-circle"
- **THEN** 使用 Close 组件并添加圆形背景样式

#### Scenario: 圆形确认图标
- **WHEN** 原代码使用 AtIcon value="check-circle"
- **THEN** 使用 CheckChecked 组件
