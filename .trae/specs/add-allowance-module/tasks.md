# Tasks

## 第一阶段：数据模型与基础设施（核心闭环前置）

- [ ] Task 1: 定义零用钱数据模型
  - [ ] 1.1 在 `src/types/index.ts` 中新增 WalletAccount 接口（totalBalance, consumeBalance, saveBalance, shareBalance, totalEarned, totalSpent）
  - [ ] 1.2 新增 AllowanceTransaction 接口（id, type: income/expense, category, amount, title, date, remark, mood, source, account, parentComment, reviewStatus, createdAt）
  - [ ] 1.3 新增 WishItem 接口（id, title, targetAmount, savedAmount, imageData, status, createdAt, completedAt）
  - [ ] 1.4 新增 AllowanceSettings 接口（exchangeRate, singleExchangeLimit, dailyExchangeLimit, weeklyExchangeLimit, requireReview, consumeRatio, saveRatio, shareRatio, alertThreshold, parentPassword, fixedAllowance 配置）
  - [ ] 1.5 新增 AllowanceAchievement 接口（id, name, description, icon, unlocked, rewardStarCoins, unlockedAt）
  - [ ] 1.6 扩展 AppData 接口，新增 wallet, allowanceTransactions, wishItems, allowanceAchievements, allowanceSettings 字段

- [ ] Task 2: 扩展存储与状态管理
  - [ ] 2.1 修改 `src/utils/storage.ts`，在 getDefaultData 中添加零用钱模块默认值，在 loadData 中处理旧数据迁移（补全新字段默认值）
  - [ ] 2.2 修改 `src/store/useAppStore.ts`，新增零用钱相关方法：exchangeStarCoins, addAllowanceTransaction, adjustRatios, recordExpense, recordIncome, updateAllowanceSettings, reviewExchange, grantAllowance, addWishItem, updateWishProgress, checkAndUnlockAchievements, setMood
  - [ ] 2.3 修改 `src/utils/sync.ts`，确保零用钱数据纳入同步推送范围

## 第二阶段：孩子端核心页面（核心闭环）

- [ ] Task 3: 钱包主页 `src/pages/allowance/WalletHomePage.tsx`
  - [ ] 3.1 余额总览卡片（大字显示可用零用钱总额，累计赚取/支出/结余）
  - [ ] 3.2 三金账户分区（消费金/储蓄金/分享金，不同颜色卡片，点击查看明细）
  - [ ] 3.3 快捷操作区（记支出、记收入、兑换零用钱三个大按钮）
  - [ ] 3.4 最近交易流水（最近8条记录，收入绿色/支出橙色）
  - [ ] 3.5 消费反思提示卡片（支出满24小时后弹出）

- [ ] Task 4: 兑换中心 `src/pages/allowance/ExchangePage.tsx`
  - [ ] 4.1 顶部展示当前星愿币余额、实时汇率、可兑换金额
  - [ ] 4.2 输入兑换数量，实时计算到账金额，「全部兑换」快捷按钮
  - [ ] 4.3 兑换前教育提示弹窗
  - [ ] 4.4 兑换成功后数字滚动动画
  - [ ] 4.5 兑换限额校验与提示

- [ ] Task 5: 记账页 `src/pages/allowance/AddRecordPage.tsx`
  - [ ] 5.1 支出记录表单（名称、金额、日期、分类选择、备注、消费心情三选一）
  - [ ] 5.2 收入记录表单（来源选择：星愿兑换/家长发放/其他，金额）
  - [ ] 5.3 常用支出模板快捷入口（买文具、买零食、买玩具、交通费）
  - [ ] 5.4 金额输入超余额时拦截提示
  - [ ] 5.5 机会成本提示（存在进行中愿望时弹出）

- [ ] Task 6: 收支明细页 `src/pages/allowance/RecordListPage.tsx`
  - [ ] 6.1 按时间倒序展示全部交易记录
  - [ ] 6.2 筛选功能：时间（本周/本月/上月）、分类、收支类型
  - [ ] 6.3 单条记录点击查看详情弹窗

## 第三阶段：家长端与三金账户

- [ ] Task 7: 家长端页面
  - [ ] 7.1 家长密码验证页 `src/pages/allowance/ParentPasswordPage.tsx`（4位数字密码输入）
  - [ ] 7.2 家长设置页 `src/pages/allowance/ParentSettingsPage.tsx`（汇率、限额、审核开关、三金比例、消费预警、固定零用钱设置）
  - [ ] 7.3 家长管理页 `src/pages/allowance/ParentManagePage.tsx`（查看全部交易、添加评语、手动发放零用钱、兑换审核通过/驳回）

- [ ] Task 8: 三金账户组件 `src/components/allowance/ThreeAccountCards.tsx`
  - [ ] 8.1 消费金/储蓄金/分享金三张彩色卡片
  - [ ] 8.2 分配比例调整滑块（家长端或手动微调）
  - [ ] 8.3 点击卡片进入对应账户明细

## 第四阶段：财商分析与图表

- [ ] Task 9: 图表组件
  - [ ] 9.1 收支对比柱状图 `src/components/allowance/IncomeExpenseBarChart.tsx`
  - [ ] 9.2 支出分类饼图 `src/components/allowance/CategoryPieChart.tsx`
  - [ ] 9.3 财富趋势折线图 `src/components/allowance/WealthTrendLineChart.tsx`

- [ ] Task 10: 分析与报告页 `src/pages/allowance/AnalysisPage.tsx`
  - [ ] 10.1 收支对比区（柱状图 + 一句话总结）
  - [ ] 10.2 支出分类区（饼图，点击跳转明细）
  - [ ] 10.3 财富趋势区（折线图）
  - [ ] 10.4 月度财商报告区（核心指标、个性化建议、月度徽章）

## 第五阶段：愿望清单与成就系统

- [ ] Task 11: 愿望清单页 `src/pages/allowance/WishListPage.tsx`
  - [ ] 11.1 愿望列表展示（进度条、已存/目标金额、预计天数）
  - [ ] 11.2 新建愿望弹窗（名称、金额、图片）
  - [ ] 11.3 愿望详情页（进度可视化、存入操作、完成庆祝动画）

- [ ] Task 12: 成就徽章页 `src/pages/allowance/AchievementPage.tsx`
  - [ ] 12.1 成就徽章网格展示（已解锁高亮、未解锁灰色）
  - [ ] 12.2 等级成长展示（理财学徒→小能手→小达人→专家）
  - [ ] 12.3 解锁成就时的庆祝动画

## 第六阶段：路由与导航集成

- [ ] Task 13: 集成到主应用
  - [ ] 13.1 修改 `src/App.tsx` 新增 /allowance 路由及子路由
  - [ ] 13.2 修改 `src/components/Navigation.tsx` 新增「零用钱」Tab（💰图标）
  - [ ] 13.3 确保零用钱模块数据纳入云同步与数据导出/导入

## 第七阶段：构建验证与部署

- [ ] Task 14: 构建验证与部署
  - [ ] 14.1 TypeScript 类型检查通过
  - [ ] 14.2 生产构建成功
  - [ ] 14.3 推送代码到 GitHub 触发 Cloudflare Pages 自动部署
  - [ ] 14.4 在浏览器中验证零用钱模块各页面功能正常

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
- [Task 5] depends on [Task 2]
- [Task 6] depends on [Task 2]
- [Task 7] depends on [Task 2]
- [Task 8] depends on [Task 2]
- [Task 9] depends on [Task 2]
- [Task 10] depends on [Task 9]
- [Task 11] depends on [Task 2]
- [Task 12] depends on [Task 2]
- [Task 13] depends on [Task 3, Task 4, Task 5, Task 6, Task 7, Task 10, Task 11, Task 12]
- [Task 14] depends on [Task 13]
