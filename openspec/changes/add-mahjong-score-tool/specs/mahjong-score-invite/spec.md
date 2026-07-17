## ADDED Requirements

### Requirement: 微信分享进房

系统（小程序端）SHALL 支持通过微信分享卡片进入指定牌局。分享 path MUST 携带可解析的会话标识（会话 id 或邀请短码）。受邀用户打开后 MUST 在登录完成后加入该牌局（若尚未加入且会话仍 active）。

#### Scenario: 分享携带会话标识

- **WHEN** 参与者触发分享
- **THEN** 分享 path MUST 包含该牌局的会话标识

#### Scenario: 从分享进入 active 牌局

- **WHEN** 已登录用户打开带有效标识的分享 path 且会话为 `active`
- **THEN** 客户端 MUST 进入牌局页并完成加入（若需要）

### Requirement: 官方小程序码生成

系统 SHALL 提供需认证的官方小程序码生成 API。服务端 MUST 使用已配置的微信小程序凭证获取 `access_token`，调用微信 `getwxacodeunlimit`（或等价接口），将 `scene` 设为该牌局的邀请短码（长度 MUST ≤ 32），`page` 指向已注册的小程序页面。响应 MUST 返回可展示的图片数据（或等价 URL）。仅会话参与者可请求该牌局的码。

#### Scenario: 参与者获取小程序码

- **WHEN** 参与者请求某 `active` 或可展示牌局的小程序码
- **THEN** 系统 MUST 返回微信官方小程序码图片数据

#### Scenario: 短码持久映射

- **WHEN** 首次需要为某会话生成小程序码
- **THEN** 系统 MUST 创建或复用该会话的邀请短码记录，供 `scene` 使用

#### Scenario: 非参与者请求码

- **WHEN** 非参与者请求某会话小程序码
- **THEN** 系统 MUST 拒绝

#### Scenario: 微信凭证未配置

- **WHEN** 服务端缺少微信 appId/secret
- **THEN** 系统 MUST 返回明确错误（非空 500 堆栈）

### Requirement: 扫码解析进房

系统 SHALL 在用户通过官方小程序码进入时，从启动参数中读取 `scene`（邀请短码），解析为会话并走与分享相同的加入流程。

#### Scenario: 有效 scene 进房

- **WHEN** 用户扫码进入且 `scene` 对应 `active` 会话
- **THEN** 客户端 MUST 在登录后加入该会话并展示牌局页

#### Scenario: 无效或过期 scene

- **WHEN** `scene` 无法映射到会话，或会话已结束且策略不允许再加入
- **THEN** 客户端 MUST 提示失败并回到工具入口或安全页
