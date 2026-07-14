# 周视图滚动同步与对齐修复 - Product Requirement Document

## Overview
- **Summary**: 修复周视图中时间列滚动同步问题，以及时间标题格与星期标题行的样式对齐问题
- **Purpose**: 确保周视图在上下滚动时时间列与内容区同步滚动，同时保证视觉样式的一致性和对齐准确性
- **Target Users**: 使用iPhone、iPad和桌面浏览器的用户

## Goals
- 周视图上下滚动时，时间列与右侧内容区同步滚动
- 左上角"时间"标题格与星期标题行样式一致（大小、高度）
- 时间列每行与右侧TimelineView中的时间间隔线精确对齐

## Non-Goals (Out of Scope)
- 不修改日视图的布局和样式
- 不修改月视图的布局和样式
- 不修改任务卡片的样式

## Background & Context
- 当前周视图采用双容器布局：左侧时间列 + 右侧滚动区域
- 使用useEffect监听scroll事件同步滚动位置
- 时间列容器使用overflow-hidden，导致JS设置scrollTop无效
- 标题格使用py-3，时间行使用h-[60px]，高度不一致导致不对齐

## Functional Requirements
- **FR-1**: 时间列容器支持纵向滚动
- **FR-2**: 上下滚动时时间列与右侧内容区同步滚动
- **FR-3**: "时间"标题格与星期标题行高度一致
- **FR-4**: 时间列每行与右侧时间间隔线对齐

## Non-Functional Requirements
- **NFR-1**: 滚动同步流畅，无明显延迟
- **NFR-2**: 适配iOS Safari和桌面浏览器
- **NFR-3**: 视觉对齐精确，无错位

## Constraints
- **Technical**: React + TypeScript + Tailwind CSS
- **Dependencies**: TimelineView组件的HOUR_HEIGHT常量（60px）

## Assumptions
- HOUR_HEIGHT=60px保持不变
- 用户期望时间列与内容区完全同步滚动

## Acceptance Criteria

### AC-1: 时间列同步滚动
- **Given**: 用户在周视图页面，右侧内容区可滚动
- **When**: 用户上下滚动右侧内容区
- **Then**: 左侧时间列同步滚动，时间刻度与内容精确对齐
- **Verification**: `human-judgment`

### AC-2: 标题格样式一致
- **Given**: 用户在周视图页面
- **When**: 查看左上角"时间"标题格和星期标题行
- **Then**: 两者高度一致，字体大小一致
- **Verification**: `human-judgment`

### AC-3: 时间刻度对齐
- **Given**: 用户在周视图页面
- **When**: 查看时间列和右侧内容区
- **Then**: 时间列的"上午6时"与右侧第一条时间间隔线对齐
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无