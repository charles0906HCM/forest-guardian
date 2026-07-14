# 每日喝水目标与交互图标 - Verification Checklist

- [x] 数据类型从 waterCount: number 改为 waterLog: Record<string, number>
- [x] 默认数据中 waterLog 为空对象
- [x] 创建空水杯图标组件 EmptyCupIcon
- [x] 旧数据加载不报错，平滑迁移
- [x] 三个页面标题后显示8个空水杯图标
- [x] 点击空水杯图标完成喝水（+1星愿币，图标变蓝）
- [x] 点击蓝色水杯图标取消喝水（-1星愿币，图标变空）
- [x] 当天多次点击喝水，计数正确累加
- [x] 超过8杯后继续添加蓝色水杯图标
- [x] 跨天后喝水计数自动归零，图标变回空水杯
- [x] 云同步时 waterLog 数据正确同步
- [x] 多设备同步后当天喝水次数一致
- [x] 所有涉及 waterCount 的地方都已更新为 waterLog
- [x] TypeScript 类型检查通过
- [ ] iPhone和iPad上图标显示和交互正常
