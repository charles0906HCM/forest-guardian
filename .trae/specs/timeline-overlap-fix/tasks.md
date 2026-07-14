# 森林小卫士 - 时间轴优化与移动端访问修复实现计划

## [/] Task 1: 实现时间轴任务重叠计算算法
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 实现任务重叠检测算法，计算每个时间点的任务数量（最大列数）
  - 为每个任务分配列位置（left和width）
  - 参考苹果日历的重叠布局方式
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 2个重叠任务并排显示各占50%宽度
  - `human-judgement` TR-1.2: 3个重叠任务并排显示各占约33%宽度
  - `human-judgement` TR-1.3: 部分重叠任务正确分配列位置
- **Notes**: 使用贪心算法，按开始时间排序后分配列

## [ ] Task 2: 简化任务卡片内容
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改TimelineView组件，移除科目标签和星愿币显示
  - 任务卡片仅显示任务名称和左侧科目颜色条
  - 保持点击跳转番茄钟和编辑功能
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 任务卡片仅显示名称和颜色标识
  - `human-judgement` TR-2.2: 点击任务仍能跳转到番茄钟
  - `human-judgement` TR-2.3: 悬停仍能显示编辑按钮
- **Notes**: 参考用户提供的附图设计

## [ ] Task 3: 验证iPhone访问配置
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 检查vite配置是否正确绑定0.0.0.0
  - 检查index.html是否有正确的viewport设置
  - 添加server.cors配置确保跨域访问
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 在iPhone上通过IP地址访问网页能正常加载
  - `human-judgement` TR-3.2: 在iPad上通过IP地址访问网页能正常加载
- **Notes**: 需要确保防火墙允许5173端口访问