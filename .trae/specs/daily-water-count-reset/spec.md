# 每日喝水计数重置 - Product Requirement Document

## Overview
- **Summary**: 将喝水计数从累计计数改为按日重置，每天的喝水图标数量根据当天点击喝水好习惯的次数显示，次日自动归零重新计数。
- **Purpose**: 让用户每天都有新的喝水目标，养成每日喝水的好习惯，避免累计计数越来越多失去意义。
- **Target Users**: 使用番茄专注和习惯管理功能的学生用户

## Goals
- 喝水计数按自然日独立统计，每天从零开始
- 三个页面（任务清单、番茄专注、星愿币）标题后的水杯图标数量显示当天喝水次数
- 次日自动重置计数，图标数量归零
- 数据同步时保持各设备当天喝水次数一致

## Non-Goals (Out of Scope)
- 不实现历史喝水记录统计图表
- 不实现喝水目标设定和提醒
- 不修改好习惯奖励的星愿币逻辑

## Background & Context
- 当前喝水计数（waterCount）是累计的，点击一次就永久加1
- 用户希望每天重新计数，作为每日喝水的激励
- 需要确保多设备同步时，当天的喝水次数一致
- 数据存储需要从简单数字改为按日期记录的结构

## Functional Requirements
- **FR-1**: 喝水计数按自然日独立统计，每天从零开始
- **FR-2**: 点击"喝水"好习惯时，当天喝水次数加1
- **FR-3**: 任务清单页面标题后显示当天喝水次数对应的水杯图标
- **FR-4**: 番茄专注页面标题后显示当天喝水次数对应的水杯图标
- **FR-5**: 星愿币页面标题后显示当天喝水次数对应的水杯图标
- **FR-6**: 跨天自动重置，新的一天喝水次数归零
- **FR-7**: 云同步时正确同步各天的喝水记录，确保当天计数一致

## Non-Functional Requirements
- **NFR-1**: 页面加载时能正确判断是否跨天，自动重置当天计数
- **NFR-2**: 数据结构变更后，旧数据能平滑迁移
- **NFR-3**: 同步时不影响其他数据的同步逻辑

## Constraints
- **Technical**: React + TypeScript + Zustand + localStorage + Supabase
- **Business**: 不影响现有好习惯奖励的星愿币功能
- **Dependencies**: 依赖现有的数据同步机制

## Assumptions
- 用户设备时间准确
- 日期按用户本地时间计算
- 只需要记录当天的喝水次数，不需要历史统计

## Acceptance Criteria

### AC-1: 点击喝水当天计数增加
- **Given**: 用户在星愿币页面
- **When**: 点击一次"喝水"好习惯的加号按钮
- **Then**: 当天喝水次数加1，三个页面标题后增加一个水杯图标
- **Verification**: `human-judgment`

### AC-2: 当天多次点击正确计数
- **Given**: 用户已点击2次喝水
- **When**: 再点击3次喝水
- **Then**: 总共显示5个水杯图标
- **Verification**: `human-judgment`

### AC-3: 跨天自动重置
- **Given**: 昨天用户点击了5次喝水
- **When**: 今天打开应用
- **Then**: 水杯图标数量为0，当天喝水次数从零开始
- **Verification**: `human-judgment`

### AC-4: 多设备同步一致
- **Given**: 电脑上点击了3次喝水并同步
- **When**: iPhone上点击立即同步
- **Then**: iPhone上也显示3个水杯图标
- **Verification**: `human-judgment`

### AC-5: 旧数据平滑迁移
- **Given**: 用户已有累计的waterCount数据
- **When**: 升级到新版本
- **Then**: 不报错，当天喝水次数从0开始
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要保留历史喝水记录供查询？
- [ ] 是否需要设置每日喝水目标（如每天8杯）？
