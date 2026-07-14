# Tasks

- [x] Task 1: 修改数据类型和存储逻辑
  - [x] 修改 `src/types/index.ts`：RepeatType 新增 `"workday" | "custom"`，Task 接口新增 `repeatDays: number[]` 字段（0=周日, 1=周一, ..., 6=周六）
  - [x] 修改 `src/utils/storage.ts`：loadData 中确保 repeatDays 字段存在（默认空数组）
  - [x] 修改 `src/utils/date.ts`：repeatTypeLabel 函数新增 workday→"工作日重复"、custom→"自定义重复"
  - [x] 修改 `src/store/useAppStore.ts`：addTask 中添加 repeatDays 默认值
  - [x] 验证：TypeScript 类型检查通过

- [x] Task 2: 修改任务日期匹配逻辑
  - [x] 修改 `src/utils/date.ts` 中 `isTaskActiveOnDate` 函数：
    - workday 类型：检查 `fromISODate(dateStr).getDay()` 是否为 1-5（周一至周五）
    - custom 类型：检查 `fromISODate(dateStr).getDay()` 是否在 `task.repeatDays` 数组中
  - [x] 验证：代码逻辑正确，使用 `?? []` 兼容旧数据

- [x] Task 3: 修改任务表单 UI
  - [x] 修改 `src/components/TaskFormModal.tsx`：
    - 重复选项按钮从3个扩展为5个：不重复、每日、每周、工作日、自定义
    - 新增 `repeatDays` state（默认空数组）
    - 选择"自定义"时下方显示周一到周日7个可复选圆形按钮
    - 编辑任务时正确加载 repeatDays
    - 保存时：custom 类型必须至少选一天，否则提示"请至少选择一天"
    - 保存时将 repeatDays 传入 taskData
  - [x] 重复提示文案支持新类型（workday→"工作日（周一至周五）"、custom→"每周选定的日子"）
  - [x] 验证：代码修改正确，TypeScript 类型检查通过

# Task Dependencies
- Task 1 → Task 2（日期匹配依赖类型定义）
- Task 1 → Task 3（UI 依赖类型定义）
- Task 2 和 Task 3 可并行
