# 周视图左上角标题遮挡与 iPad 圆角修复 Spec

## Why
当前周视图在上下滚动时，左侧滚动上来的时间刻度会显示在左上角"时间"标题格的下方但没有被完全遮挡，视觉效果混乱。同时 iPad 上表格背景的四个角超出外层圆角容器，形成突出的尖角，影响美观。

## What Changes
- 提升左上角"时间"标题格的层级，使其在上下滚动时始终遮挡下方滚动上来的时间刻度
- 修复 iPad 上周视图背景在圆角容器四角突出的问题，确保内容被外层 `rounded-2xl overflow-hidden` 正确裁剪
- 保持时间列与右侧内容区的同步滚动行为不变

## Impact
- Affected code: `/Users/charles/Documents/TraePJ/src/pages/TaskListPage.tsx`
- Affected capabilities: 任务清单页周视图渲染、iPad 视觉一致性

## ADDED Requirements

### Requirement: 左上角标题始终置顶遮挡
The system SHALL ensure the top-left "时间" header cell stays at the topmost visual layer during vertical scrolling.

#### Scenario: 上下滚动周视图
- **WHEN** 用户在周视图中上下滚动
- **THEN** 左上角"时间"标题格保持在最前端显示
- **AND** 下方滚动上来的时间刻度被该标题格遮挡，不显示在标题格之上或穿过标题格

### Requirement: iPad 圆角裁剪
The system SHALL clip the week view grid content to match the outer `rounded-2xl` container corners on iPad Safari.

#### Scenario: 在 iPad 上打开周视图
- **WHEN** 用户在 iPad 上查看周视图
- **THEN** 表格背景的四个角不出现超出外层圆角矩形的突出部分
- **AND** 视觉上与外层 glass-card 的圆角完全一致
