# Tasks

- [x] Task 1: 修改日视图时间轴起始时间为6:00
  - [x] 修改 `src/components/TimelineView.tsx` 中 `START_HOUR` 从 5 改为 6
  - [x] 验证：日视图时间轴从上午6时开始显示

- [x] Task 2: 重构周视图为课程表样式
  - [x] 修改 `src/pages/TaskListPage.tsx` 中周视图部分：左侧固定一列时间轴，右侧周一到周日7列在一页同时显示
  - [x] 整体可左右滑动浏览（类似课程表布局）
  - [x] 时间列固定不随滑动移动（sticky定位）
  - [x] 验证：周视图一页内可见全部7天，时间列固定在左侧

- [x] Task 3: 月视图取消农历并改为周一开头
  - [x] 修改 `src/components/MonthCalendar.tsx`：移除 `getLunarDay` 函数及相关农历代码，移除农历日期渲染
  - [x] 修改 `WEEKDAYS` 数组从 `["日","一","二","三","四","五","六"]` 改为 `["一","二","三","四","五","六","日"]`
  - [x] 修改 `getDaysInMonth` 函数中起始日计算逻辑，以周一为一周起始
  - [x] 验证：月视图无农历显示，星期标题从周一到周日排列

- [x] Task 4: 任务表单星愿币最低值改为0
  - [x] 修改 `src/components/TaskFormModal.tsx` 中星愿币滑块 `min={1}` 改为 `min={0}`
  - [x] 验证：星愿币可设置为0

- [x] Task 5: 习惯和奖品编辑功能
  - [x] 在 `src/store/useAppStore.ts` 中新增 `updateHabit` 和 `updateReward` 方法
  - [x] 修改 `src/pages/RewardsPage.tsx` 中 `HabitFormModal` 组件支持编辑模式（接收 editingHabit 参数，预填数据，保存时调用 updateHabit）
  - [x] 修改 `src/pages/RewardsPage.tsx` 中 `RewardFormModal` 组件支持编辑模式（接收 editingReward 参数，预填数据，保存时调用 updateReward）
  - [x] 在习惯列表项中添加编辑按钮（Pencil 图标），点击打开编辑弹窗
  - [x] 在奖品卡片中添加编辑按钮（Pencil 图标），点击打开编辑弹窗
  - [x] 验证：习惯可编辑名称和星愿币数量，奖品可编辑名称和星愿币数量

- [x] Task 6: 番茄钟支持无任务模式
  - [x] 修改 `src/pages/PomodoroPage.tsx`：移除开始按钮的 `!selectedTask` 禁用条件
  - [x] 当未选择任务时，允许用户手动设定时间（保留时间预设按钮和自定义输入）
  - [x] 修改 `handleFinish` 函数：当无任务时仅播放完成音效，不记录任务完成，不调用 recordPomodoro（或记录无关联的专注会话）
  - [x] 未选任务时右侧计时区域显示时间设定控件而非"请先选择任务"提示
  - [x] 验证：不选择任务可设定时间并开始专注计时，结束时不报错

# Task Dependencies
- Task 1, 3, 4 互相独立，可并行
- Task 2 独立
- Task 5 的 store 修改和 UI 修改有依赖（先加方法再改UI）
- Task 6 独立
