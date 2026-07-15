# 零用钱财商模块 Spec

## Why
将打卡奖励「星愿币」与虚拟零用钱体系打通，形成「劳动赚取 → 自主分配 → 消费记录 → 数据复盘 → 目标储蓄」的完整闭环，培养7-12岁小学生的财商思维与正确金钱观念。全程纯虚拟记账，不接入任何真实支付。

## What Changes
- 新增零用钱数据模型（WalletAccount、AllowanceTransaction、WishItem、AllowanceAchievement、AllowanceSettings）扩展到 AppData
- 新增零用钱相关页面路由（钱包主页、兑换页、记账页、明细页、分析页、愿望清单页、家长端页面）
- 新增零用钱状态管理方法到 useAppStore
- 新增导航入口：底部导航栏增加「零用钱」Tab
- 扩展 Supabase 同步数据范围，包含零用钱模块数据
- 新增图表组件（柱状图、饼图、折线图）用于财商分析

## Impact
- Affected specs: 数据同步（新增字段需纳入同步）、导航结构（新增Tab）
- Affected code:
  - `src/types/index.ts` — 新增数据模型
  - `src/store/useAppStore.ts` — 新增状态管理方法
  - `src/utils/storage.ts` — 新增默认数据与迁移
  - `src/utils/sync.ts` — 扩展同步范围
  - `src/App.tsx` — 新增路由
  - `src/components/Navigation.tsx` — 新增导航项
  - 新增 `src/pages/allowance/` 目录下多个页面
  - 新增 `src/components/allowance/` 目录下多个组件

## ADDED Requirements

### Requirement: 星愿币兑换零用钱系统
系统 SHALL 提供星愿币到零用钱的兑换功能，作为零用钱的核心来源。

#### Scenario: 家长设置兑换规则
- **WHEN** 家长进入零用钱设置页并配置汇率（如10星愿币=1元）
- **THEN** 汇率保存到 AllowanceSettings，孩子端兑换页实时显示当前汇率

#### Scenario: 孩子发起兑换
- **WHEN** 孩子输入兑换星愿币数量并确认
- **THEN** 系统按汇率计算到账金额，弹出教育提示弹窗，确认后星愿币余额扣减、零用钱余额增加，记录自动归入「收入-星愿兑换」

#### Scenario: 兑换超出限额
- **WHEN** 孩子发起的兑换超出单次上限或每日/每周限额
- **THEN** 系统阻止兑换并提示「超出限额」

#### Scenario: 审核模式下的兑换
- **WHEN** 家长开启兑换审核开关，孩子发起兑换
- **THEN** 兑换进入待审核状态，家长端显示待审核记录，家长通过后才到账

### Requirement: 三金账户体系
系统 SHALL 将零用钱自动拆分为消费金、储蓄金、分享金三个账户。

#### Scenario: 收入自动拆分
- **WHEN** 一笔收入到账（兑换/家长发放）
- **THEN** 按家长设置的默认比例（如50%/30%/20%）自动拆分到三个账户

#### Scenario: 手动调整分配比例
- **WHEN** 孩子手动调整分配比例
- **THEN** 系统按新比例重新分配当前余额

#### Scenario: 支出扣款
- **WHEN** 孩子记录一笔支出并选择从消费金账户扣款
- **THEN** 消费金余额减少，总余额同步减少

### Requirement: 收支明细记录
系统 SHALL 提供完整的收支记录功能。

#### Scenario: 记录支出
- **WHEN** 孩子填写支出信息（名称、金额、分类、日期、心情等）并保存
- **THEN** 记录保存到 AllowanceTransaction 列表，对应账户余额扣减

#### Scenario: 记录收入
- **WHEN** 家长手动发放零用钱或记录其他收入
- **THEN** 记录保存并按比例拆分到三金账户

#### Scenario: 消费反思
- **WHEN** 支出记录满24小时后用户打开应用
- **THEN** 首页弹出反思提示卡片，用户可选择「值得」「一般」「后悔」

### Requirement: 财商分析与可视化图表
系统 SHALL 提供直观的财商数据图表。

#### Scenario: 查看收支对比
- **THEN** 显示本月收入vs支出柱状图、结余/超支标识与一句话总结

#### Scenario: 查看支出分类
- **THEN** 显示环形饼图展示各类支出占比，点击色块跳转该分类明细

#### Scenario: 查看财富趋势
- **THEN** 显示近3个月余额变化折线图

#### Scenario: 月度财商报告
- **THEN** 自动生成月度总结含核心指标与个性化建议

### Requirement: 储蓄目标/愿望清单
系统 SHALL 提供愿望储蓄目标功能，培养延迟满足能力。

#### Scenario: 创建愿望
- **WHEN** 孩子输入物品名称和目标金额
- **THEN** 创建 WishItem，进度为0%，自动计算预计达成天数

#### Scenario: 机会成本提示
- **WHEN** 记录支出时存在进行中的愿望
- **THEN** 弹出提示告知该支出会让愿望延迟X天实现

#### Scenario: 完成愿望
- **WHEN** 储蓄金中已存金额达到目标金额
- **THEN** 标记愿望完成，触发庆祝动画

### Requirement: 家长管控端
系统 SHALL 提供家长管控功能，所有规则修改需密码验证。

#### Scenario: 家长密码验证
- **WHEN** 进入家长端设置/管理页面
- **THEN** 弹出4位数字密码输入，验证通过后才可进入

#### Scenario: 家长审核兑换
- **WHEN** 孩子发起待审核兑换
- **THEN** 家长端显示待审核列表，可通过或驳回

#### Scenario: 消费预警
- **WHEN** 孩子单笔支出超过家长设置的预警阈值
- **THEN** 系统在家长端显示预警记录

### Requirement: 成就与游戏化
系统 SHALL 提供成就徽章和等级成长系统。

#### Scenario: 解锁成就
- **WHEN** 用户达成条件（连续记账7天、本月结余、完成首个愿望等）
- **THEN** 自动解锁对应徽章并奖励星愿币

#### Scenario: 等级升级
- **WHEN** 综合指标（记账天数、储蓄率、目标完成数）达到升级条件
- **THEN** 等级提升，显示升级动画

## MODIFIED Requirements

### Requirement: AppData 数据结构
AppData 接口新增以下字段：
- `wallet: WalletAccount` — 钱包账户数据
- `allowanceTransactions: AllowanceTransaction[]` — 零用钱交易记录
- `wishItems: WishItem[]` — 愿望清单
- `allowanceAchievements: AllowanceAchievement[]` — 成就记录
- `allowanceSettings: AllowanceSettings` — 零用钱设置

### Requirement: 导航结构
底部导航栏新增「零用钱」Tab，图标使用💰，路径为 `/allowance`

### Requirement: 数据同步
Supabase 同步的 AppData 范围扩展，包含零用钱模块全部新增字段

## REMOVED Requirements
无移除项。
