# 森林小卫士 - 日历视图重构与跨设备访问实现计划

## [x] Task 1: 配置 vite 支持跨设备访问
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 vite.config.ts 添加 server.host = '0.0.0.0'
  - 确保开发服务器可以通过IP地址访问
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgement` TR-1.1: 在iPhone/iPad上通过IP地址访问网页，确认能正常加载
- **Notes**: 同时检查index.html的viewport设置是否正确

## [x] Task 2: 创建时间轴组件 (TimelineView)
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建TimelineView组件，显示5:00-23:00的时间轴
  - 任务根据startTime定位，根据endTime计算高度
  - 支持点击任务打开编辑或番茄钟
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 时间轴显示完整，时间刻度清晰
  - `human-judgement` TR-2.2: 任务正确定位在对应时间位置
- **Notes**: 需要将时间字符串转换为分钟数来计算位置

## [x] Task 3: 创建月视图组件 (MonthCalendar)
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建MonthCalendar组件，显示月历网格
  - 包含星期标题、日期数字、农历显示
  - 任务以标签形式显示在日期下方，最多显示5个，超过显示...
  - 支持点击日期切换到日视图
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 月历网格显示正确，包含前后月份的日期
  - `human-judgement` TR-3.2: 任务标签显示在对应日期下方，最多5个
  - `human-judgement` TR-3.3: 任务超过5个时显示...
  - `human-judgement` TR-3.4: 点击日期能切换到日视图
- **Notes**: 需要计算农历日期，可简化为显示日期数字

## [x] Task 4: 重构 TaskListPage 整合新视图
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 日视图：使用TimelineView组件替换现有列表
  - 周视图：使用TimelineView组件创建七列布局，移动端支持横向滚动
  - 月视图：使用MonthCalendar组件
  - 保留筛选功能和科目筛选
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-5
- **Test Requirements**:
  - `human-judgement` TR-4.1: 日/周/月视图切换正常
  - `human-judgement` TR-4.2: 筛选功能在所有视图中正常工作
  - `human-judgement` TR-4.3: 数据在视图切换后保持一致
  - `human-judgement` TR-4.4: 周视图在移动端支持横向滚动
- **Notes**: 使用overflow-x-auto实现横向滚动

## [x] Task 5: 添加"今天"快速跳转按钮
- **Priority**: high
- **Depends On**: Task 4
- **Description**: 
  - 在日期导航区域添加"今天"按钮
  - 点击后快速跳转到今天的日期并切换到日视图
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-5.1: 点击"今天"按钮能正确跳转到今天并切换到日视图
- **Notes**: 参考苹果日历的设计

## [x] Task 6: 实现数据导出/导入功能
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在store中添加导出数据方法，将所有数据导出为JSON文件
  - 添加导入数据方法，读取JSON文件并覆盖现有数据
  - 在星愿币页面添加导出/导入按钮
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `human-judgement` TR-6.1: 点击导出按钮能下载JSON文件
  - `human-judgement` TR-6.2: 选择导入文件后数据被正确覆盖
- **Notes**: 使用Blob和URL.createObjectURL实现文件下载

## [ ] Task 7: 响应式优化与移动端适配
- **Priority**: medium
- **Depends On**: Task 4
- **Description**: 
  - 优化周视图在移动端的显示，添加横向滚动
  - 优化月视图在移动端的点击区域
  - 确保所有按钮和交互元素在移动端可点击
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-7.1: 在iPhone上所有视图显示正常
  - `human-judgement` TR-7.2: 在iPad上所有视图显示正常
- **Notes**: 使用touch-action和scrollbar优化滚动体验