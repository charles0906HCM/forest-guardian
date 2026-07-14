# 森林小卫士 - 任务删除与时间轴修复 PRD

## Overview
- **Summary**: 修复任务无法删除的问题，优化时间轴重叠任务显示效果
- **Purpose**: 提升用户体验，确保任务可以正常删除，时间轴重叠任务正确并排显示
- **Target Users**: 小学生及家长

## Goals
- [x] 在任务编辑弹窗中添加删除按钮，确保任务可以被删除
- [x] 修复时间轴中重叠任务的布局计算，确保任务正确并排显示且呈现完整矩形

## Non-Goals (Out of Scope)
- 不修改任务列表视图的删除功能
- 不添加新的任务管理功能

## Background & Context
- 当前TaskCard组件已有删除功能，但TaskFormModal编辑弹窗中没有删除按钮
- 时间轴中重叠任务的计算逻辑存在缺陷，导致任务没有正确并排显示
- 用户反馈同时段任务重叠显示不清晰，没有呈现完整的矩形

## Functional Requirements
- **FR-1**: 任务编辑弹窗中添加删除按钮，点击后确认删除任务
- **FR-2**: 时间轴重叠任务正确并排显示，每个任务占据完整矩形空间
- **FR-3**: 任务重叠时自动计算列数，确保所有任务都能完整显示

## Non-Functional Requirements
- **NFR-1**: 保持森林系毛玻璃设计风格
- **NFR-2**: 重叠计算性能良好，不影响页面渲染

## Constraints
- **Technical**: React + TypeScript + Tailwind CSS
- **Dependencies**: lucide-react, zustand

## Assumptions
- [ ] 用户通过编辑弹窗进入任务详情时可能需要删除任务
- [ ] 时间轴中同一时间段最多可能有5个重叠任务

## Acceptance Criteria

### AC-1: 编辑弹窗删除功能
- **Given**: 用户打开任务编辑弹窗
- **When**: 点击删除按钮并确认
- **Then**: 任务被成功删除，弹窗关闭，任务从列表中消失
- **Verification**: `human-judgment`

### AC-2: 两个重叠任务并排显示
- **Given**: 日视图或周视图中有两个时间段完全重叠的任务
- **When**: 页面加载完成
- **Then**: 两个任务并排显示，各占约50%宽度，呈现完整矩形
- **Verification**: `human-judgment`

### AC-3: 三个重叠任务并排显示
- **Given**: 日视图或周视图中有三个时间段重叠的任务
- **When**: 页面加载完成
- **Then**: 三个任务并排显示，各占约33%宽度，呈现完整矩形
- **Verification**: `human-judgment`

### AC-4: 部分重叠任务正确布局
- **Given**: 日视图或周视图中有多个部分时间重叠的任务
- **When**: 页面加载完成
- **Then**: 任务正确分配列位置，重叠部分并排显示，不重叠部分可扩展
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无
