# 番茄钟任务列表已完成任务折叠 - 实施计划

## [x] Task 1: 添加折叠状态管理
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 PomodoroPage 组件中添加 useState 状态 `showCompleted`，默认值为 false
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgment` TR-1.1: 页面加载时 `showCompleted` 应为 false，已完成任务默认隐藏

## [x] Task 2: 分离已完成和未完成任务
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在组件中计算 `completedTasks` 和 `uncompletedTasks` 两个数组
  - 使用 isTaskCompletedOnDate 判断任务完成状态
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 任务应正确分离到已完成和未完成数组
  - `human-judgment` TR-2.2: 无已完成任务时 `completedTasks` 数组为空

## [x] Task 3: 修改任务列表渲染逻辑
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 默认只渲染未完成任务列表
  - 当 `showCompleted` 为 true 时，在未完成任务下方渲染已完成任务列表
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 默认只显示未完成任务
  - `human-judgment` TR-3.2: 展开时显示已完成任务，且样式为灰色/删除线
  - `human-judgment` TR-3.3: 折叠时隐藏已完成任务

## [x] Task 4: 添加折叠/展开按钮
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 在未完成任务列表下方添加按钮（仅当有已完成任务时显示）
  - 按钮显示已完成任务数量
  - 点击按钮切换 `showCompleted` 状态
  - 按钮文字根据状态切换（"显示 X 个已完成任务"/"隐藏已完成任务"）
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `human-judgment` TR-4.1: 有已完成任务时显示按钮，显示正确数量
  - `human-judgment` TR-4.2: 无已完成任务时不显示按钮
  - `human-judgment` TR-4.3: 点击按钮切换折叠/展开状态，文字正确变化

## [x] Task 5: 添加折叠/展开动画
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 使用 CSS transition 实现已完成任务区域的平滑高度过渡
  - 使用 overflow-hidden 和 max-height 实现动画效果
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-5.1: 折叠/展开时有平滑的高度过渡动画
  - `human-judgment` TR-5.2: 动画时长在 200-300ms 之间