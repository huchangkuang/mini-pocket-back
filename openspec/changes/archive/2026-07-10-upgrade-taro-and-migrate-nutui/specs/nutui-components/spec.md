## ADDED Requirements

### Requirement: Button 组件替代
系统 SHALL 使用 @nutui/nutui-react-taro 的 Button 组件替代 taro-ui 的 AtButton。

#### Scenario: 主要按钮渲染
- **WHEN** 使用 `<Button type="primary">` 渲染按钮
- **THEN** 按钮显示为实心主色调样式

#### Scenario: 次要按钮渲染
- **WHEN** 使用 `<Button type="default" fill="outline">` 渲染按钮
- **THEN** 按钮显示为边框次要样式

#### Scenario: 按钮点击事件
- **WHEN** 用户点击 Button 组件
- **THEN** 触发 onClick 回调函数

### Requirement: Switch 组件替代
系统 SHALL 使用 @nutui/nutui-react-taro 的 Switch 组件替代 taro-ui 的 AtSwitch。

#### Scenario: 开关状态切换
- **WHEN** 用户点击 Switch 组件
- **THEN** 组件切换 checked 状态并触发 onChange 回调

#### Scenario: 禁用状态
- **WHEN** Switch 组件设置 disabled={true}
- **THEN** 组件显示禁用样式且不可点击

### Requirement: Range 组件替代
系统 SHALL 使用 @nutui/nutui-react-taro 的 Range 组件替代 taro-ui 的 AtSlider。

#### Scenario: 滑块值变化
- **WHEN** 用户拖动 Range 滑块
- **THEN** 触发 onChange 回调并传递新的数值

#### Scenario: 滑块范围限制
- **WHEN** 设置 min 和 max 属性
- **THEN** 滑块值 SHALL 在 min 和 max 范围内
