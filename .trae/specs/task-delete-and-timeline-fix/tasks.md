# 森林小卫士 - 任务删除与时间轴修复实现计划

## [ ] Task 1: 重写时间轴任务重叠计算算法
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 重写calculateTaskLayouts函数，使用正确的贪心算法计算重叠任务布局
  - 确保每个任务的totalColumns是其时间段内的最大重叠数
  - 确保任务正确分配到列，并排显示且呈现完整矩形
  - 参考苹果日历的重叠布局方式
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-1.1: 2个完全重叠任务并排显示各占50%宽度，呈现完整矩形
  - `human-judgement` TR-1.2: 3个完全重叠任务并排显示各占约33%宽度，呈现完整矩形
  - `human-judgement` TR-1.3: 部分重叠任务正确分配列位置，布局合理
  - `human-judgement` TR-1.4: 任务卡片完整显示，不被截断
- **Notes**: 使用经典的会议室分配贪心算法，按开始时间排序后分配最早可用的列

## [ ] Task 2: 在任务编辑弹窗中添加删除按钮
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在TaskFormModal组件中添加删除按钮（仅在编辑模式下显示）
  - 点击删除按钮后弹出确认对话框
  - 确认后调用deleteTask删除任务并关闭弹窗
  - 使用与TaskCard一致的删除确认文案
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-2.1: 编辑模式下弹窗底部显示删除按钮
  - `human-judgement` TR-2.2: 点击删除按钮弹出确认对话框
  - `human-judgement` TR-2.3: 确认删除后任务被删除，弹窗关闭
  - `human-judgement` TR-2.4: 新建任务模式下不显示删除按钮
- **Notes**: 删除按钮样式与现有风格保持一致，使用红色系提示危险操作

## [ ] Task 3: 验证修复效果
- **Priority**: medium
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 验证时间轴重叠任务显示效果
  - 验证任务删除功能正常工作
  - 检查周视图中的时间轴显示是否正确
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-3.1: 日视图重叠任务显示正确
  - `human-judgement` TR-3.2: 周视图重叠任务显示正确
  - `human-judgement` TR-3.3: 任务删除功能在编辑弹窗中正常工作
