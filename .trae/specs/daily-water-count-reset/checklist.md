# 每日喝水计数重置 - Verification Checklist

- [ ] 数据类型从 waterCount: number 改为 waterLog: Record<string, number>
- [ ] 默认数据中 waterLog 为空对象
- [ ] 旧数据加载不报错，平滑迁移
- [ ] 点击喝水好习惯后，当天喝水次数增加1
- [ ] 当天多次点击喝水，计数正确累加
- [ ] 任务清单页面标题后显示正确数量的水杯图标
- [ ] 番茄专注页面标题后显示正确数量的水杯图标
- [ ] 星愿币页面标题后显示正确数量的水杯图标
- [ ] 跨天后喝水计数自动归零
- [ ] 云同步时 waterLog 数据正确同步
- [ ] 多设备同步后当天喝水次数一致
- [ ] 所有涉及 waterCount 的地方都已更新为 waterLog
- [ ] TypeScript 类型检查通过
