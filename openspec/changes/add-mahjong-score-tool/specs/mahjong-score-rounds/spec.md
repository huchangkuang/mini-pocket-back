## ADDED Requirements

### Requirement: 每局唯一草稿轮

系统 SHALL 为每个 `active` 牌局维护至多一条草稿轮。草稿四席分数均为可空整数（`null` 表示未填）。保存草稿 MUST 允许只更新部分座位；至少一席非 `null` 方可写入。

#### Scenario: 保存部分分数

- **WHEN** 参与者提交 A=80、B=-20、C=null、D=null 且会话无草稿
- **THEN** 系统 MUST 创建草稿轮并持久化上述值

#### Scenario: 更新已有草稿

- **WHEN** 参与者在已有草稿上提交 C=-30（其余未传或保持）
- **THEN** 系统 MUST 合并更新草稿对应座位分数

#### Scenario: 全空保存

- **WHEN** 参与者提交四席均为 null
- **THEN** 系统 MUST 拒绝或忽略写入（MUST NOT 创建空草稿）

#### Scenario: 已存在草稿时不再创建第二条

- **WHEN** 会话已有草稿且再次保存草稿
- **THEN** 系统 MUST 更新同一条草稿，MUST NOT 产生第二条草稿轮

### Requirement: 四人齐全自动转正

当草稿保存后四席均非 `null` 时，系统 MUST 在同一事务中将该草稿转为已提交历史轮（分配递增轮次号），并清除「当前草稿」状态。转正时 MUST NOT 因总和不为 0 而阻止转正；响应 MUST 指示本轮是否平衡（四席之和是否为 0），供客户端提示。

#### Scenario: 第四人分数填齐后转正

- **WHEN** 草稿原为三席有值一席 null，保存使第四席亦有值
- **THEN** 系统 MUST 产生一条 committed 历史轮，且该会话不再有草稿

#### Scenario: 转正时总和不为 0

- **WHEN** 四席齐且之和不为 0
- **THEN** 系统 MUST 仍转正为历史轮，并在响应中标明不平衡

#### Scenario: 转正时总和为 0

- **WHEN** 四席齐且之和为 0
- **THEN** 系统 MUST 转正并标明平衡

### Requirement: 修改历史轮须齐全且总和为 0

系统 SHALL 允许参与者在 `active` 会话中修改已转正历史轮。请求 MUST 提供四席全部整数分数，且四席之和 MUST 为 0；否则 MUST 拒绝。修改 MUST NOT 将历史轮改回草稿或把任一分改为 null。

#### Scenario: 合法修改历史轮

- **WHEN** 参与者对某 committed 轮提交四席分且之和为 0，会话为 `active`
- **THEN** 系统 MUST 更新该轮分数并重算受影响累计分

#### Scenario: 修改时缺席位

- **WHEN** 修改请求缺少任一席分数或含 null
- **THEN** 系统 MUST 返回错误且不更新

#### Scenario: 修改时总和不为 0

- **WHEN** 修改请求四席齐全但之和不为 0
- **THEN** 系统 MUST 返回错误且不更新

#### Scenario: 结束后修改历史

- **WHEN** 会话已 `ended` 且用户请求修改历史轮
- **THEN** 系统 MUST 拒绝

### Requirement: 累计分由历史轮汇总

系统 SHALL 以已转正历史轮之和计算各座位累计分；草稿分 MUST NOT 计入累计总分展示所用的「已确认累计」（客户端可另示「含草稿预览」，但快照中的正式累计 MUST 仅含 committed）。

#### Scenario: 仅草稿无历史

- **WHEN** 会话仅有草稿、无 committed 轮
- **THEN** 正式累计分 MUST 全为 0（或等价空累计）

#### Scenario: 多轮累计

- **WHEN** 存在多轮 committed 分数
- **THEN** 各座位累计 MUST 等于各轮对应座位分数之和
