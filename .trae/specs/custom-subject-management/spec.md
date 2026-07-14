# 森林小卫士 - 自定义学科分类 PRD

## Overview
- **Summary**: 实现学科分类的自定义功能，支持新增、删除和修改分类颜色
- **Purpose**: 让用户可以根据自己的需求自定义学科分类，提高使用灵活性
- **Target Users**: 小学生及家长

## Goals
- [x] 支持新增自定义学科分类（可设置名称、颜色、表情图标）
- [x] 支持修改已有分类的颜色和名称
- [x] 支持删除自定义分类（内置分类不可删除）
- [x] 所有使用学科分类的地方同步更新

## Non-Goals (Out of Scope)
- 不修改四象限分类功能
- 不添加分类排序功能
- 不添加分类图标上传功能（使用emoji）

## Background & Context
- 当前学科分类是硬编码的：数学、语文、英语、其他
- 用户需要更多自定义分类以适应不同学科需求
- 学科颜色用于任务卡片、时间轴、月历等多处显示

## Functional Requirements
- **FR-1**: 用户可以新增自定义学科，设置名称、颜色和emoji图标
- **FR-2**: 用户可以修改已有学科的名称、颜色和emoji图标
- **FR-3**: 用户可以删除自定义学科，内置学科（数学、语文、英语、其他）不可删除
- **FR-4**: 删除学科时，如果有任务使用该学科，需要提示用户并询问是否迁移到"其他"分类
- **FR-5**: 任务表单中的学科选择列表动态显示所有学科
- **FR-6**: 学科数据持久化存储，支持导出导入

## Non-Functional Requirements
- **NFR-1**: 保持森林系毛玻璃设计风格
- **NFR-2**: 操作简单直观，适合小学生使用
- **NFR-3**: 颜色选择器提供预设颜色，操作便捷

## Constraints
- **Technical**: React + TypeScript + Tailwind CSS + Zustand
- **Dependencies**: lucide-react

## Assumptions
- [ ] 内置4个学科（数学、语文、英语、其他）不可删除
- [ ] 删除有任务关联的学科时，任务自动迁移到"其他"分类
- [ ] 使用emoji作为学科图标，用户从预设列表中选择

## Acceptance Criteria

### AC-1: 新增学科分类
- **Given**: 用户打开学科管理弹窗
- **When**: 填写名称、选择颜色和emoji，点击添加
- **Then**: 新学科被添加到列表中，任务表单中可选
- **Verification**: `human-judgment`

### AC-2: 修改学科分类
- **Given**: 用户打开学科管理弹窗
- **When**: 修改某个学科的名称、颜色或emoji
- **Then**: 学科信息更新，所有使用该学科的地方同步更新显示
- **Verification**: `human-judgment`

### AC-3: 删除学科分类
- **Given**: 用户打开学科管理弹窗，选择一个自定义学科
- **When**: 点击删除并确认
- **Then**: 学科被删除，如有任务使用该学科则迁移到"其他"分类
- **Verification**: `human-judgment`

### AC-4: 内置学科不可删除
- **Given**: 用户打开学科管理弹窗
- **When**: 查看内置学科（数学、语文、英语、其他）
- **Then**: 没有删除按钮或删除按钮禁用
- **Verification**: `human-judgment`

### AC-5: 学科选择列表动态更新
- **Given**: 用户添加或删除了学科
- **When**: 打开任务创建/编辑表单
- **Then**: 学科选择列表显示最新的学科列表
- **Verification**: `human-judgment`

### AC-6: 数据持久化
- **Given**: 用户添加了自定义学科
- **When**: 刷新页面或重新打开应用
- **Then**: 自定义学科仍然存在
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无
