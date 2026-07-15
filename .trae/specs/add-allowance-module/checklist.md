# 零用钱财商模块 验证清单

## 数据模型
- [ ] WalletAccount 接口定义完整，包含 totalBalance、consumeBalance、saveBalance、shareBalance、totalEarned、totalSpent 字段
- [ ] AllowanceTransaction 接口定义完整，包含 type(income/expense)、category、amount、title、date、mood、source、account、reviewStatus 等字段
- [ ] WishItem 接口定义完整，包含 title、targetAmount、savedAmount、status(active/completed) 字段
- [ ] AllowanceSettings 接口定义完整，包含 exchangeRate、限额、审核开关、三金比例、家长密码等配置
- [ ] AllowanceAchievement 接口定义完整，包含 unlocked、rewardStarCoins 等字段
- [ ] AppData 接口已扩展包含 wallet、allowanceTransactions、wishItems、allowanceAchievements、allowanceSettings

## 存储与状态管理
- [ ] storage.ts 中 getDefaultData 包含零用钱模块默认值
- [ ] storage.ts 中 loadData 能正确迁移旧数据（补全新字段默认值）
- [ ] useAppStore 中 exchangeStarCoins 方法正确扣减星愿币并增加零用钱
- [ ] useAppStore 中 addAllowanceTransaction 方法正确记录交易并更新余额
- [ ] useAppStore 中三金分配比例调整功能正确
- [ ] 零用钱数据纳入云同步推送范围
- [ ] 零用钱数据纳入导出/导入功能

## 兑换系统
- [ ] 兑换页正确显示当前星愿币余额和汇率
- [ ] 输入兑换数量后实时计算到账金额
- [ ] 「全部兑换」按钮功能正确
- [ ] 兑换前弹出教育提示弹窗
- [ ] 兑换成功后星愿币扣减、零用钱增加、记录生成
- [ ] 超出限额时正确阻止并提示
- [ ] 审核模式下兑换进入待审核状态

## 三金账户
- [ ] 收入到账时按比例自动拆分到消费金/储蓄金/分享金
- [ ] 三金卡片用不同颜色区分（蓝色/金色/粉色）
- [ ] 点击三金卡片可查看对应账户明细

## 记账与明细
- [ ] 支出记录表单完整（名称、金额、日期、分类、心情）
- [ ] 收入记录表单完整（来源、金额）
- [ ] 常用支出模板一键记账功能正常
- [ ] 金额超出余额时拦截提示
- [ ] 交易明细页筛选功能正常（时间、分类、收支类型）
- [ ] 消费反思提示在支出满24小时后弹出

## 图表与分析
- [ ] 收支对比柱状图正确渲染
- [ ] 支出分类饼图正确渲染且可点击跳转
- [ ] 财富趋势折线图正确渲染
- [ ] 月度财商报告包含核心指标与个性化建议

## 愿望清单
- [ ] 创建愿望功能正常
- [ ] 进度条正确展示已存/目标金额
- [ ] 完成愿望时触发庆祝效果
- [ ] 机会成本提示在存在进行中愿望时弹出

## 家长端
- [ ] 进入家长端需密码验证
- [ ] 家长设置页可修改汇率、限额、比例等配置
- [ ] 家长管理页可查看全部交易、添加评语
- [ ] 家长可手动发放零用钱
- [ ] 兑换审核通过/驳回功能正常

## 成就系统
- [ ] 达成条件时自动解锁徽章
- [ ] 解锁徽章时奖励星愿币
- [ ] 等级成长逻辑正确

## 路由与导航
- [ ] 底部导航栏显示「零用钱」Tab
- [ ] /allowance 路由正确加载钱包主页
- [ ] 子路由（兑换、记账、明细、分析、愿望、成就、家长端）均可正常访问

## 构建与部署
- [ ] TypeScript 类型检查通过（npm run check）
- [ ] 生产构建成功（npm run build）
- [ ] 部署后页面可正常访问
