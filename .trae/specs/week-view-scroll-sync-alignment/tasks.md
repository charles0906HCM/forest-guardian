# 周视图滚动同步与对齐修复 - Implementation Plan

## [x] Task 1: 修复时间列滚动同步问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将时间列容器的overflow-hidden改为overflow-y-auto
  - 确保JS同步scrollTop能够正常工作
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 上下滚动右侧内容区，时间列同步滚动
  - `human-judgment` TR-1.2: 滚动到底部时，时间列也滚动到底部
- **Notes**: 确保时间列容器高度与右侧滚动区域高度一致

## [x] Task 2: 修复标题格样式对齐问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 调整"时间"标题格的高度，使其与星期标题行一致
  - 调整字体大小，使其与星期标题行一致
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: "时间"标题格与星期标题行高度一致
  - `human-judgment` TR-2.2: "时间"标题格字体大小与星期标题行一致
- **Notes**: 星期标题行使用py-3，需要确保时间标题格也使用相同的padding

## [x] Task 3: 修复时间列与时间间隔线对齐问题
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 确保时间列每行高度为HOUR_HEIGHT(60px)
  - 确保时间列顶部与右侧内容区顶部对齐
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: "上午6时"与右侧第一条时间间隔线对齐
  - `human-judgment` TR-3.2: 所有时间刻度与对应时间间隔线对齐
- **Notes**: TimelineView中的时间间隔线从(START_HOUR + 1) * HOUR_HEIGHT开始，需要确保时间列的对齐方式一致