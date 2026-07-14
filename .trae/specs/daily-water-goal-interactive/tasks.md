# 每日喝水目标与交互图标 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 修改数据类型和默认值
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 types/index.ts 中的 AppData 接口，将 waterCount: number 改为 waterLog: Record<string, number>（日期为key，次数为value）
  - 修改 storage.ts 中的 getDefaultData，waterLog 默认值为 {}
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-1.1: TypeScript 类型检查通过
  - `programmatic` TR-1.2: 默认数据中 waterLog 为空对象
- **Notes**: 保持向后兼容，旧的 waterCount 字段在迁移时处理

## [x] Task 2: 创建空水杯图标组件
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建 EmptyCupIcon.tsx 组件，显示白色空杯子（无蓝色水）
  - 确保样式与 WaterCupIcon 一致，只是没有蓝色水
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-2.1: 空水杯图标显示为白色杯子
  - `human-judgement` TR-2.2: 空水杯图标与蓝色水杯图标大小一致
- **Notes**: 参考 WaterCupIcon 的样式，移除蓝色水部分

## [x] Task 3: 修改存储和迁移逻辑
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改 loadData() 函数，处理旧数据 waterCount 到 waterLog 的迁移（旧数据忽略，从0开始）
  - 修改 saveData() 确保正确保存 waterLog
- **Acceptance Criteria Addressed**: AC-6, AC-8
- **Test Requirements**:
  - `programmatic` TR-3.1: 旧数据加载不报错
  - `programmatic` TR-3.2: 新数据格式正确保存
- **Notes**: 旧的累计 waterCount 不迁移，每天从零开始

## [x] Task 4: 修改状态管理逻辑
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 修改 useAppStore.ts 中的 waterCount 状态为 waterLog
  - 添加 todayWaterCount 计算属性（获取当天喝水次数）
  - 修改 triggerHabit 函数，点击喝水时增加当天的计数
  - 添加 cancelHabit 函数，取消喝水时减少当天的计数
  - 修改 mergeRemoteData、applyRemoteData、syncNow、scheduleSyncPush、persist 等所有涉及 waterCount 的地方
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-5, AC-7
- **Test Requirements**:
  - `programmatic` TR-4.1: 点击喝水后当天计数增加
  - `programmatic` TR-4.2: 取消喝水后当天计数减少
  - `programmatic` TR-4.3: 同步数据包含 waterLog
  - `human-judgement` TR-4.4: 代码中所有 waterCount 引用都已更新
- **Notes**: 使用 todayISO() 函数获取当天日期字符串

## [x] Task 5: 修改三个页面的图标显示和交互
- **Priority**: high
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 修改 TaskListPage.tsx，显示8个空水杯图标，点击空水杯完成喝水，点击蓝色水杯取消喝水，超过8杯后继续添加蓝色水杯
  - 修改 PomodoroPage.tsx，同上
  - 修改 RewardsPage.tsx，同上
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-5.1: 任务清单页面显示8个空水杯，点击交互正确
  - `human-judgement` TR-5.2: 番茄专注页面显示8个空水杯，点击交互正确
  - `human-judgement` TR-5.3: 星愿币页面显示8个空水杯，点击交互正确
- **Notes**: 确保图标内联显示，与标题对齐，点击响应流畅

## [x] Task 6: 跨天检测和自动重置
- **Priority**: medium
- **Depends On**: Task 5
- **Description**: 
  - 在 useAppStore 中添加跨天检测逻辑
  - 页面可见性变化时检查是否跨天
  - 跨天后当天计数自动为0（因为 waterLog 中没有当天的记录）
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-6.1: 切换到第二天后所有图标变回空水杯
  - `programmatic` TR-6.2: waterLog 中不存在当天记录时返回0
- **Notes**: 利用 waterLog 的日期key特性，新的一天自然没有记录，返回0即可
