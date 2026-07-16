# Tasks

- [x] Task 1: 修复三金账户点击空白页问题
  - [x] 1.1 在 `src/pages/allowance/WalletHomePage.tsx` 中新增账户明细弹窗组件 `AccountDetailModal`，展示指定账户的交易记录列表
  - [x] 1.2 将三金账户卡片的 `onClick` 从 `navigate` 改为 `setSelectedAccount(type)` 打开弹窗
  - [x] 1.3 弹窗内按时间倒序展示该账户的 `allowanceTransactions`，收入绿色、支出橙色，与首页交易流水样式一致

- [x] Task 2: 新增愿望编辑与删除功能
  - [x] 2.1 在 `src/store/useAppStore.ts` 中新增 `updateWishItem(id, updates)` 方法，支持修改 title 和 targetAmount
  - [x] 2.2 在 `src/store/useAppStore.ts` 中新增 `deleteWishItem(id)` 方法
  - [x] 2.3 在 `src/pages/allowance/WishListPage.tsx` 的 `WishDetailModal` 中新增「编辑」按钮，点击后名称和目标金额变为可编辑输入框
  - [x] 2.4 在 `WishDetailModal` 中新增「删除」按钮，点击后弹出确认提示，确认后调用 `deleteWishItem` 并关闭弹窗

- [x] Task 3: 实现支出超额跨账户提示与多账户选择
  - [x] 3.1 在 `src/pages/allowance/AddRecordPage.tsx` 中，当支出金额超出所选账户余额但总余额足够时，弹出确认弹窗提示是否切换多账户模式
  - [x] 3.2 新增多账户选择模式：将 `account: AccountType` 改为 `selectedAccounts: AccountType[]`，用户可勾选多个账户
  - [x] 3.3 多账户模式下按勾选顺序依次扣款，计算各账户分配金额并展示
  - [x] 3.4 修改 `src/store/useAppStore.ts` 的 `recordExpense` 方法，支持传入 `accounts: AccountType[]` 参数，依次从各账户扣款
  - [x] 3.5 交易记录的 `account` 字段记录主账户（第一个扣款账户），`remark` 中注明各账户分配明细

- [ ] Task 4: 构建验证与部署
  - [ ] 4.1 TypeScript 类型检查通过
  - [ ] 4.2 生产构建成功
  - [ ] 4.3 推送代码到 GitHub 触发自动部署

# Task Dependencies
- [Task 2] depends on nothing (可与 Task 1 并行)
- [Task 3] depends on nothing (可与 Task 1、2 并行)
- [Task 4] depends on [Task 1, Task 2, Task 3]
