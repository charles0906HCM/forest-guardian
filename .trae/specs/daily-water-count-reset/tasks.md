# 每日喝水计数重置 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 修改数据类型和默认值
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 types/index.ts 中的 AppData 接口，将 waterCount: number 改为 waterLog: Record<string, number>（日期为key，次数为value）
  - 修改 storage.ts 中的 getDefaultData，waterLog 默认值为 {}
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-1.1: TypeScript 类型检查通过
  - `programmatic` TR-1.2: 默认数据中 waterLog 为空对象
- **Notes**: 保持向后兼容，旧的 waterCount 字段在迁移时处理

## [ ] Task 2: 修改存储和迁移逻辑
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改 loadData() 函数，处理旧数据 waterCount 到 waterLog 的迁移（旧数据忽略，从0开始）
  - 修改 saveData() 确保正确保存 waterLog
- **Acceptance Criteria Addressed**: AC-5, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 旧数据加载不报错
  - `programmatic` TR-2.2: 新数据格式正确保存
- **Notes**: 旧的累计 waterCount 不迁移，每天从零开始

## [ ] Task 3: 修改状态管理逻辑
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 useAppStore.ts 中的 waterCount 状态为 waterLog
  - 添加 todayWaterCount 计算属性（获取当天喝水次数）
  - 修改 triggerHabit 函数，点击喝水时增加当天的计数
  - 修改 mergeRemoteData、applyRemoteData、syncNow、scheduleSyncPush、persist 等所有涉及 waterCount 的地方
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-3.1: 点击喝水后当天计数增加
  - `programmatic` TR-3.2: 同步数据包含 waterLog
  - `human-judgement` TR-3.3: 代码中所有 waterCount 引用都已更新
- **Notes**: 使用 todayISO() 函数获取当天日期字符串

## [ ] Task 4: 修改三个页面的图标显示
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 修改 TaskListPage.tsx，使用 todayWaterCount 显示水杯图标
  - 修改 PomodoroPage.tsx，使用 todayWaterCount 显示水杯图标
  - 修改 RewardsPage.tsx，使用 todayWaterCount 显示水杯图标
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `human-judgement` TR-4.1: 任务清单页面图标数量正确
  - `human-judgement` TR-4.2: 番茄专注页面图标数量正确
  - `human-judgement` TR-4.3: 星愿币页面图标数量正确
- **Notes**: 确保图标内联显示，与标题对齐

## [ ] Task 5: 跨天检测和自动重置
- **Priority**: medium
- **Depends On**: Task 4
- **Description**: 
  - 在 App 组件或 useAppStore 中添加跨天检测逻辑
  - 页面可见性变化时检查是否跨天
  - 跨天后当天计数自动为0（因为 waterLog 中没有当天的记录）
- **Acceptance Criteria Addressed**: AC-3, AC-6
- **Test Requirements**:
  - `human-judgement` TR-5.1: 切换到第二天后图标数量归零
  - `programmatic` TR-5.2: waterLog 中不存在当天记录时返回0
- **Notes**: 利用 waterLog 的日期key特性，新的一天自然没有记录，返回0即可
