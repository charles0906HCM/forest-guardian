# 每日喝水目标与交互图标 - Product Requirement Document

## Overview
- **Summary**: 实现每日喝水目标系统，显示8个空水杯图标作为每日目标，点击空水杯图标视为完成一次喝水并显示蓝色水杯，点击已完成的水杯图标可取消喝水记录，超过目标后可继续添加水杯图标，次日自动重置。
- **Purpose**: 通过可视化目标和交互方式激励用户养成每日喝水习惯，提供直观的进度反馈。
- **Target Users**: 使用番茄专注和习惯管理功能的学生用户

## Goals
- 喝水计数按自然日独立统计，每天从零开始
- 显示8个空水杯图标作为每日喝水目标
- 点击空水杯图标完成一次喝水（加星愿币），图标变为蓝色水杯
- 点击蓝色水杯图标取消喝水（减星愿币），图标变为空水杯
- 超过8杯后继续添加蓝色水杯图标
- 次日自动重置，所有图标变回空水杯
- 多设备同步时保持当天喝水次数一致

## Non-Goals (Out of Scope)
- 不实现自定义喝水目标数量
- 不实现历史喝水记录统计图表
- 不实现喝水提醒功能

## Background & Context
- 当前喝水计数是累计的，没有每日目标和交互反馈
- 用户希望通过可视化的水杯图标直观了解当天喝水进度
- 需要支持点击图标直接完成/取消喝水，无需切换到星愿币页面
- 数据存储需要从简单数字改为按日期记录的结构

## Functional Requirements
- **FR-1**: 喝水计数按自然日独立统计，每天从零开始
- **FR-2**: 在三个页面（任务清单、番茄专注、星愿币）标题后显示8个空水杯图标
- **FR-3**: 点击空水杯图标视为点击一次"喝水"好习惯（+1星愿币），图标变为蓝色水杯
- **FR-4**: 点击蓝色水杯图标取消喝水记录（-1星愿币），图标变回空水杯
- **FR-5**: 当天完成8杯后，继续点击"喝水"好习惯可额外增加蓝色水杯图标
- **FR-6**: 跨天自动重置，所有图标变回空水杯
- **FR-7**: 云同步时正确同步各天的喝水记录，确保当天计数一致

## Non-Functional Requirements
- **NFR-1**: 页面加载时能正确判断是否跨天，自动重置当天计数
- **NFR-2**: 数据结构变更后，旧数据能平滑迁移
- **NFR-3**: 同步时不影响其他数据的同步逻辑
- **NFR-4**: 图标点击响应流畅，无明显延迟

## Constraints
- **Technical**: React + TypeScript + Zustand + localStorage + Supabase
- **Business**: 不影响现有好习惯奖励的星愿币功能
- **Dependencies**: 依赖现有的数据同步机制

## Assumptions
- 用户设备时间准确
- 日期按用户本地时间计算
- 默认每日喝水目标为8杯
- 点击图标触发的喝水与在星愿币页面点击喝水按钮效果一致

## Acceptance Criteria

### AC-1: 空水杯图标显示
- **Given**: 用户打开任务清单/番茄专注/星愿币页面
- **When**: 当天还没有喝水
- **Then**: 标题后显示8个空水杯图标
- **Verification**: `human-judgment`

### AC-2: 点击空水杯完成喝水
- **Given**: 页面显示8个空水杯图标
- **When**: 点击其中一个空水杯图标
- **Then**: 该图标变为蓝色水杯，星愿币+1，waterCount+1
- **Verification**: `human-judgment`

### AC-3: 多次点击正确计数
- **Given**: 用户已点击3次空水杯
- **When**: 再点击2次空水杯
- **Then**: 显示5个蓝色水杯+3个空水杯，waterCount=5
- **Verification**: `human-judgment`

### AC-4: 点击蓝色水杯取消喝水
- **Given**: 用户已完成5次喝水（5蓝3空）
- **When**: 点击其中一个蓝色水杯图标
- **Then**: 该图标变回空水杯，星愿币-1，waterCount=4
- **Verification**: `human-judgment`

### AC-5: 超过目标继续添加
- **Given**: 用户已完成8次喝水（8个蓝色水杯）
- **When**: 在星愿币页面点击"喝水"好习惯按钮
- **Then**: 标题后显示9个蓝色水杯，waterCount=9
- **Verification**: `human-judgment`

### AC-6: 跨天自动重置
- **Given**: 昨天用户完成了5次喝水
- **When**: 今天打开应用
- **Then**: 所有图标变回空水杯，waterCount=0
- **Verification**: `human-judgment`

### AC-7: 多设备同步一致
- **Given**: 电脑上完成了3次喝水并同步
- **When**: iPhone上点击立即同步
- **Then**: iPhone上显示3个蓝色水杯+5个空水杯
- **Verification**: `human-judgment`

### AC-8: 旧数据平滑迁移
- **Given**: 用户已有累计的waterCount数据
- **When**: 升级到新版本
- **Then**: 不报错，当天喝水次数从0开始
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要支持自定义每日喝水目标数量？
- [ ] 是否需要添加喝水完成的庆祝动画？
