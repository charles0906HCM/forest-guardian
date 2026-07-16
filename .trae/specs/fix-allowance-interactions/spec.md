# 零用钱模块交互修复与增强 Spec

## Why
零用钱模块存在三金账户点击空白页、愿望清单无法编辑、支出超额时无跨账户选择等问题，影响核心功能可用性。

## What Changes
- 修复三金账户点击跳转到不存在路由 `/allowance/account/:type` 导致空白页的问题，改为弹窗展示该账户的交易明细
- 为愿望清单新增编辑（修改名称、目标金额）和删除功能
- 记支出时，若金额超出所选账户余额，弹窗提示是否从其他账户补足
- 记支出时支持多账户复选，当单一账户不足时可选择多个账户组合支付

## Impact
- Affected specs: add-allowance-module
- Affected code:
  - `src/pages/allowance/WalletHomePage.tsx` — 三金账户点击行为改为弹窗
  - `src/pages/allowance/WishListPage.tsx` — 新增编辑/删除愿望功能
  - `src/pages/allowance/AddRecordPage.tsx` — 多账户选择与超额弹窗
  - `src/store/useAppStore.ts` — 新增 `updateWishItem`、`deleteWishItem` 方法，修改 `recordExpense` 支持多账户
  - `src/types/index.ts` — `AllowanceTransaction.account` 扩展为数组或增加 `accounts` 字段

## ADDED Requirements

### Requirement: 三金账户明细弹窗
点击钱包主页的三金账户卡片时，系统 SHALL 弹出该账户的最近交易明细弹窗，而非跳转到不存在的路由。

#### Scenario: 点击消费金卡片
- **WHEN** 用户点击消费金卡片
- **THEN** 弹出弹窗，标题为「消费金明细」，展示该账户最近交易记录，收入绿色、支出橙色

#### Scenario: 点击储蓄金卡片
- **WHEN** 用户点击储蓄金卡片
- **THEN** 弹出弹窗，标题为「储蓄金明细」，展示该账户最近交易记录

### Requirement: 愿望编辑功能
系统 SHALL 允许用户编辑已创建的愿望的名称和目标金额。

#### Scenario: 编辑愿望
- **WHEN** 用户在愿望详情弹窗中点击「编辑」按钮
- **THEN** 名称和目标金额变为可编辑输入框，保存后更新愿望信息

#### Scenario: 删除愿望
- **WHEN** 用户在愿望详情弹窗中点击「删除」按钮并确认
- **THEN** 该愿望从列表中移除

### Requirement: 支出超额跨账户提示
记支出时，若消费金额超出所选单一账户余额，系统 SHALL 弹窗提示是否使用其他账户补足差额。

#### Scenario: 超额提示
- **WHEN** 用户输入的支出金额超过所选账户余额，且其他账户有足够余额补足
- **THEN** 弹窗提示「消费金余额不足，是否从其他账户补足？」，用户可选择切换到多账户模式

#### Scenario: 总余额也不足
- **WHEN** 用户输入的支出金额超过所有三个账户余额总和
- **THEN** 提示「钱包总余额不足」，禁止提交

### Requirement: 多账户组合支出
当支出金额超过单一账户时，系统 SHALL 允许用户复选多个账户进行组合支付。

#### Scenario: 多账户选择
- **WHEN** 用户在多账户模式下勾选消费金和储蓄金
- **THEN** 系统从消费金优先扣款，不足部分从储蓄金补足，交易记录中记录各账户扣款明细

#### Scenario: 多账户提交
- **WHEN** 用户提交多账户支出
- **THEN** 各被选账户余额按分配金额分别扣减，总余额扣减总额，生成一条交易记录（account 字段记录主账户，remark 中注明各账户分配）

## MODIFIED Requirements

### Requirement: 记支出账户选择
原：仅支持从单一账户支出（consume / save / share 三选一）。
改：默认单一账户选择；当金额超出所选账户余额时，自动切换到多账户选择模式，用户可勾选多个账户，系统按勾选顺序依次扣款。
