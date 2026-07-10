## 1. 依赖升级

- [x] 1.1 升级 package.json 中所有 @tarojs/* 依赖到 4.2.0
- [x] 1.2 移除 taro-ui 依赖
- [x] 1.3 添加 @nutui/nutui-react-taro 3.0.20 依赖
- [x] 1.4 添加 @nutui/icons-react-taro 3.0.20 依赖
- [x] 1.5 添加 babel-plugin-import 开发依赖
- [x] 1.6 移除未使用的平台插件（alipay、h5、jd、qq、swan、tt）
- [x] 1.7 运行 pnpm install 安装依赖

## 2. 配置更新

- [x] 2.1 更新 babel.config.js 添加 babel-plugin-import 配置
- [x] 2.2 更新 config/index.js 移除未使用的平台配置
- [x] 2.3 移除 app.scss 中的 taro-ui 样式导入

## 3. 图标迁移（AtIcon → NutUI Icons）

- [x] 3.1 替换 src/components/searchBar 中的 AtIcon
- [x] 3.2 替换 src/components/mineTopBar 中的 AtIcon
- [x] 3.3 替换 src/components/profileHeaderLoggedIn 中的 AtIcon
- [x] 3.4 替换 src/components/levelProgress 中的 AtIcon
- [x] 3.5 替换 src/components/toolCard 中的 AtIcon
- [x] 3.6 替换 src/components/mineAuthActions 中的 AtIcon
- [x] 3.7 替换 src/components/favoritesTopBar 中的 AtIcon
- [x] 3.8 替换 src/components/favoriteCard 中的 AtIcon
- [x] 3.9 替换 src/components/mineMenuList 中的 AtIcon
- [x] 3.10 替换 src/components/toolEdit/toolFormCard 中的 AtIcon
- [x] 3.11 替换 src/components/toolEdit/toolBottomBar 中的 AtIcon
- [x] 3.12 替换 src/components/toolEdit/toolTipCard 中的 AtIcon
- [x] 3.13 替换 src/components/bottomNav 中的 AtIcon
- [x] 3.14 替换 src/components/navBar 中的 AtIcon
- [x] 3.15 替换 src/pages/classify 中的 AtIcon
- [x] 3.16 替换 src/pages/returnClock 中的 AtIcon
- [x] 3.17 替换 src/pages/guessNumber 中的 AtIcon
- [x] 3.18 替换 src/pages/beadArt 中的 AtIcon
- [x] 3.19 替换 src/pages/xiahouDun 中的 AtIcon
- [x] 3.20 替换 src/pages/doDescription 中的 AtIcon
- [x] 3.21 替换 src/pages/feedback 中的 AtIcon
- [x] 3.22 替换 src/pages/qrcode 中的 AtIcon
- [x] 3.23 替换 src/pages/hawking 中的 AtIcon
- [x] 3.24 替换 src/pages/fingerUp 中的 AtIcon
- [x] 3.25 替换 src/pages/lottery 中的 AtIcon
- [x] 3.26 替换 src/pages/metronome 中的 AtIcon

## 4. 按钮迁移（AtButton → Button）

- [x] 4.1 替换 src/pages/beadArt 中的 AtButton
- [x] 4.2 替换 src/pages/qrcode 中的 AtButton
- [x] 4.3 替换 src/pages/lottery 中的 AtButton

## 5. 滑块迁移（AtSlider → Range）

- [x] 5.1 替换 src/components/toolEdit/toolSliderRow 中的 AtSlider

## 6. 开关迁移（AtSwitch → Switch）

- [x] 6.1 替换 src/pages/lottery 中的 AtSwitch

## 7. 测试验证

- [x] 7.1 运行构建命令验证编译通过
- [ ] 7.2 在微信开发者工具中测试所有页面功能
- [ ] 7.3 验证图标显示正常
- [ ] 7.4 验证按钮样式和交互正常
- [ ] 7.5 验证滑块功能正常
- [ ] 7.6 验证开关功能正常
