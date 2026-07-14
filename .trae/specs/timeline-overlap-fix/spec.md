# 森林小卫士 - 时间轴优化与移动端访问修复 PRD

## Overview
- **Summary**: 修复时间轴中任务重叠显示问题，简化任务卡片内容，解决iPhone访问问题
- **Purpose**: 提升时间轴可读性，优化用户体验，确保移动端正常访问
- **Target Users**: 小学生及家长，需要在电脑和移动设备上使用

## Goals
- [ ] 时间轴任务重叠时并排显示（类似苹果日历）
- [ ] 任务卡片仅显示任务名称，移除分类和星愿币
- [ ] 解决iPhone无法打开网页的问题

## Non-Goals (Out of Scope)
- [ ] 不修改其他页面功能
- [ ] 不添加新的功能模块

## Background & Context
- 当前时间轴任务重叠时会叠加在一起，无法看清
- 用户希望参考苹果日历的并排显示方式
- iPhone通过隔空传送访问localhost无法打开，需要确保通过IP地址访问

## Functional Requirements
- **FR-1**: 时间轴中时间重叠的任务并排显示，自动计算列数和位置
- **FR-2**: 任务卡片仅显示任务名称和科目颜色标识，移除科目标签和星愿币
- **FR-3**: 确保iPhone能通过IP地址访问网页

## Non-Functional Requirements
- **NFR-1**: 保持森林系毛玻璃设计风格
- **NFR-2**: 性能优化，重叠计算不影响渲染速度

## Constraints
- **Technical**: React + TypeScript + Tailwind CSS
- **Dependencies**: lucide-react, zustand, react-router-dom

## Assumptions
- [ ] 用户通过访问同一局域网IP地址在移动设备上访问网页
- [ ] 任务数量不会过多（<50个）

## Acceptance Criteria

### AC-1: 任务重叠并排显示
- **Given**: 用户在日视图或周视图中，有多个任务时间重叠
- **When**: 页面加载完成
- **Then**: 重叠任务并排显示，每个任务占据一部分宽度，不互相遮挡
- **Verification**: `human-judgment`

### AC-2: 任务卡片简化
- **Given**: 用户在时间轴视图中
- **When**: 查看任务卡片
- **Then**: 任务卡片仅显示任务名称和科目颜色标识，不显示分类标签和星愿币
- **Verification**: `human-judgment`

### AC-3: iPhone访问
- **Given**: 开发服务器已启动
- **When**: 在iPhone上通过IP地址访问网页
- **Then**: 网页正常加载，所有功能可用
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无