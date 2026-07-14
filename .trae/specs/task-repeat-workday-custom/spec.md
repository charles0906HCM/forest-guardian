# 任务重复选项增强（工作日+自定义）Spec

## Why
当前任务重复选项仅有"不重复"、"每日"、"每周"三种，无法满足"仅工作日重复"和"自定义选择周几重复"的需求。用户需要更灵活的重复选项来管理不同类型的周期任务。

## What Changes
- 重复类型新增"工作日"选项（周一至周五重复）
- 重复类型新增"自定义"选项（自由选择周一到周日任意天数，可复选）
- Task 数据结构新增 `repeatDays` 字段存储自定义重复的星期几
- 任务日期匹配逻辑支持新的重复类型

## Impact
- Affected code:
  - `src/types/index.ts` — RepeatType 新增类型，Task 接口新增 repeatDays 字段
  - `src/components/TaskFormModal.tsx` — 重复选项 UI 增加"工作日"和"自定义"按钮，自定义模式下显示星期选择器
  - `src/utils/date.ts` — `isTaskActiveOnDate` 函数支持 workday 和 custom 类型判断
  - `src/utils/storage.ts` — 默认数据和数据加载处理 repeatDays 字段
  - `src/utils/date.ts` — `repeatTypeLabel` 函数支持新类型中文标签

## ADDED Requirements

### Requirement: 工作日重复
系统应提供"工作日"重复选项，选择后任务仅在周一至周五重复出现。

#### Scenario: 选择工作日重复
- **WHEN** 用户在新建/修改任务时选择"工作日"重复
- **THEN** 任务在每周一至周五出现，周六和周日不显示

### Requirement: 自定义星期重复
系统应提供"自定义"重复选项，允许用户选择一周中的任意天数（可复选），任务仅在选中的星期几重复。

#### Scenario: 选择自定义重复
- **WHEN** 用户选择"自定义"重复后，点击周一、周三、周五
- **THEN** 任务每周一、周三、周五出现，其他天不显示

#### Scenario: 自定义未选择任何天
- **WHEN** 用户选择"自定义"重复但未选择任何星期
- **THEN** 保存按钮提示"请至少选择一天"

## MODIFIED Requirements

### Requirement: 重复类型定义
RepeatType 从 `"none" | "daily" | "weekly"` 扩展为 `"none" | "daily" | "weekly" | "workday" | "custom"`。

### Requirement: 任务日期匹配
`isTaskActiveOnDate` 函数新增对 workday 和 custom 类型的判断：
- workday: 检查目标日期的星期是否为周一至周五（getDay() 1-5）
- custom: 检查目标日期的 getDay() 是否在 task.repeatDays 数组中

### Requirement: 重复选项 UI
重复选项从3个按钮扩展为5个按钮：不重复、每日、每周、工作日、自定义。选择"自定义"时下方显示星期选择器（周一到周日7个可复选按钮）。
