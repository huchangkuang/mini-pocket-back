## ADDED Requirements

### Requirement: 创建牌局会话

系统 SHALL 提供需 JWT 认证的创建牌局 API。成功后 MUST 创建 `active` 状态会话，MUST 将创建者写入参与者列表并标记为创建者，MUST 返回会话标识（含可供展示的短号与进房用 id/短码）。

#### Scenario: 成功创建

- **WHEN** 已认证用户请求创建牌局
- **THEN** 系统 MUST 返回新会话信息，`status` 为 `active`，且创建者为参与者

#### Scenario: 未认证

- **WHEN** 无 JWT 请求创建牌局
- **THEN** 系统 MUST 返回 HTTP 401

### Requirement: 加入牌局

系统 SHALL 允许已认证用户通过会话 id 或邀请短码加入 `active` 牌局。重复加入同一会话 MUST 幂等（不重复插入参与者）。已结束会话 MUST NOT 允许新加入。

#### Scenario: 通过分享链接加入

- **WHEN** 已认证用户携带有效会话 id 请求加入且会话为 `active`
- **THEN** 系统 MUST 将其加入参与者列表并返回完整会话快照

#### Scenario: 通过邀请短码加入

- **WHEN** 已认证用户携带有效邀请短码请求加入且会话为 `active`
- **THEN** 系统 MUST 解析到对应会话并完成加入

#### Scenario: 加入已结束牌局

- **WHEN** 用户请求加入 `ended` 会话
- **THEN** 系统 MUST 拒绝加入

### Requirement: 参与者对等写权限

系统 SHALL 将创建者标识仅用于展示（如房主星标）。任一参与者 MUST 能执行保存草稿、修改历史轮、邀请相关读取/生成、以及结束牌局；MUST NOT 因非创建者而拒绝上述写操作。

#### Scenario: 非创建者保存草稿

- **WHEN** 非创建者的参与者保存草稿分
- **THEN** 系统 MUST 接受并更新草稿（会话仍为 `active`）

#### Scenario: 非创建者结束牌局

- **WHEN** 非创建者的参与者在二次确认后请求结束牌局
- **THEN** 系统 MUST 将会话置为 `ended`

#### Scenario: 非参与者写操作

- **WHEN** 已认证但未加入该会话的用户请求保存草稿或结束
- **THEN** 系统 MUST 拒绝

### Requirement: 结束牌局并丢弃草稿

系统 SHALL 提供结束牌局 API。结束时 MUST 将 `status` 设为 `ended`，MUST 丢弃该会话上的草稿轮（若存在），MUST 保留已转正历史轮且此后 MUST NOT 允许任何写分操作。

#### Scenario: 结束时存在草稿

- **WHEN** 参与者结束仍含草稿分的牌局
- **THEN** 系统 MUST 丢弃草稿，历史轮仍可只读查询

#### Scenario: 结束后写分

- **WHEN** 用户对 `ended` 会话保存草稿或修改历史轮
- **THEN** 系统 MUST 拒绝

### Requirement: 获取会话快照

系统 SHALL 提供获取牌局快照的 API（需为参与者）。响应 MUST 包含会话状态、创建者 id、参与者列表、各座位累计分、当前草稿（若有）、已转正历史轮（可分页或最近 N 条），以及用于客户端同步的版本/更新时间。

#### Scenario: 参与者拉取快照

- **WHEN** 参与者请求会话快照
- **THEN** 系统 MUST 返回上述字段且不暴露无关会话数据

### Requirement: 历史列表为参与过的牌局

系统 SHALL 提供当前用户参与过的牌局列表（含自己创建与受邀加入的），按时间倒序。列表项 MUST 包含短号、状态、结束或创建时间、以及各座位最终/累计分摘要（若有）。

#### Scenario: 用户曾加入他人牌局

- **WHEN** 用户请求历史列表且曾作为非创建者加入某局并已结束
- **THEN** 该局 MUST 出现在列表中

#### Scenario: 未参与的牌局

- **WHEN** 用户从未加入某会话
- **THEN** 该会话 MUST NOT 出现在其历史列表中
