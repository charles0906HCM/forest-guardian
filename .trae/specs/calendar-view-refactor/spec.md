# 森林小卫士 - 日历视图重构与跨设备访问 PRD

## Overview
- **Summary**: 参考苹果系统日历功能，重构任务清单的日/周/月视图，同时修复iPhone和iPad无法访问网页的问题，确保数据在不同设备间保持一致
- **Purpose**: 提升任务管理的用户体验，使视图更直观；解决移动端访问问题
- **Target Users**: 小学生及家长，需要在电脑和移动设备上使用

## Goals
- [ ] 日视图：显示时间轴（5:00-23:00），任务根据时间放置在对应位置
- [ ] 周视图：显示周一到周日七列，每列显示时间轴和任务，移动端支持横向滚动
- [ ] 月视图：显示月历网格，日期下方显示任务标签，最多显示5个，超过显示...
- [ ] 修复移动端访问问题（iPhone/iPad）
- [ ] 数据跨设备同步：支持导出/导入数据文件
- [ ] 添加"今天"快速跳转按钮

## Non-Goals (Out of Scope)
- [ ] 不添加新的任务属性字段
- [ ] 不修改现有任务创建/编辑表单逻辑
- [ ] 不实现实时云端同步功能（仅支持导出/导入文件）

## Background & Context
- 现有视图是简单列表形式，用户希望参考苹果日历的时间轴和网格布局
- 移动端无法访问可能是因为vite没有绑定到0.0.0.0
- 数据使用localStorage存储，需要确保跨设备数据通过同一存储方式保持一致

## Functional Requirements
- **FR-1**: 日视图显示24小时时间轴，任务根据startTime定位在对应时间段
- **FR-2**: 周视图显示周一到周日七列时间轴，任务显示在对应日期和时间位置，移动端支持横向滚动
- **FR-3**: 月视图显示月历网格，包含日期、星期、农历，任务以标签形式显示在日期下方，最多显示5个，超过显示...
- **FR-4**: 支持点击日期切换日视图，点击任务打开编辑或番茄钟
- **FR-5**: 配置vite使其可通过IP地址访问，支持移动端访问
- **FR-6**: 支持导出数据为JSON文件，支持导入JSON文件恢复数据
- **FR-7**: 添加"今天"快速跳转按钮

## Non-Functional Requirements
- **NFR-1**: 响应式设计，适配手机、平板、电脑不同屏幕尺寸
- **NFR-2**: 保持森林系毛玻璃设计风格
- **NFR-3**: 性能优化，月视图渲染流畅

## Constraints
- **Technical**: React + TypeScript + Tailwind CSS
- **Dependencies**: lucide-react, zustand, react-router-dom
- **Data**: localStorage本地存储

## Assumptions
- [ ] 用户通过访问同一局域网IP地址在移动设备上访问网页
- [ ] 通过导出/导入JSON文件实现跨设备数据同步

## Acceptance Criteria

### AC-1: 日视图时间轴显示
- **Given**: 用户在任务列表页面，视图模式为"日"
- **When**: 页面加载完成
- **Then**: 显示5:00-23:00的时间轴，任务根据其startTime和endTime显示在对应时间位置
- **Verification**: `human-judgment`

### AC-2: 周视图多列时间轴
- **Given**: 用户在任务列表页面，视图模式为"周"
- **When**: 切换到周视图
- **Then**: 显示周一到周日七列，每列显示当天的时间轴和任务，移动端支持横向滚动
- **Verification**: `human-judgment`

### AC-3: 月视图日历网格
- **Given**: 用户在任务列表页面，视图模式为"月"
- **When**: 切换到月视图
- **Then**: 显示当前月份日历网格，包含日期数字、星期、农历，有任务的日期下方显示任务标签，最多显示5个，超过显示...
- **Verification**: `human-judgment`

### AC-4: 移动端访问
- **Given**: 开发者启动开发服务器
- **When**: 在iPhone/iPad上通过IP地址访问
- **Then**: 网页正常加载，所有功能可用
- **Verification**: `human-judgment`

### AC-5: 数据一致性
- **Given**: 用户在电脑上创建任务并保存
- **When**: 在同一设备上刷新页面
- **Then**: 任务数据保持不变
- **Verification**: `human-judgment`

### AC-6: 数据导出
- **Given**: 用户在任何页面
- **When**: 点击导出数据按钮
- **Then**: 下载包含所有数据的JSON文件
- **Verification**: `human-judgment`

### AC-7: 数据导入
- **Given**: 用户在任何页面
- **When**: 选择导入JSON文件并确认
- **Then**: 数据被覆盖为导入的内容
- **Verification**: `human-judgment`

### AC-8: 今天快速跳转
- **Given**: 用户在任务列表页面的任意视图
- **When**: 点击"今天"按钮
- **Then**: 跳转到今天的日期并切换到日视图
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无