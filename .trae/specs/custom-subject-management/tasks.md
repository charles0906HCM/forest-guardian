# 森林小卫士 - 自定义学科分类实现计划

## [ ] Task 1: 修改类型定义和数据结构
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将 Subject 类型从联合类型改为 string
  - 新增 SubjectItem 接口定义学科数据结构（id, label, emoji, color, bg, isBuiltIn）
  - 修改 AppData 接口添加 subjects 数组
  - 提供默认内置学科配置
- **Acceptance Criteria Addressed**: AC-4, AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: TypeScript 类型检查通过
  - `human-judgement` TR-1.2: 默认内置4个学科正确初始化
- **Notes**: bg 由 color 自动计算，不单独存储

## [ ] Task 2: 在 Store 中添加学科管理功能
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 添加 addSubject, updateSubject, deleteSubject 方法
  - 删除学科时，如果有任务使用该学科，自动迁移到"其他"分类
  - 内置学科不可删除
  - 学科数据持久化到 localStorage
  - 更新 exportData 和 importData 支持学科数据
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-6
- **Test Requirements**:
  - `human-judgement` TR-2.1: 可以添加新学科
  - `human-judgement` TR-2.2: 可以修改学科名称/颜色/emoji
  - `human-judgement` TR-2.3: 自定义学科可以删除
  - `human-judgement` TR-2.4: 内置学科不可删除
  - `human-judgement` TR-2.5: 删除有任务的学科时任务迁移到"其他"
  - `human-judgement` TR-2.6: 刷新页⾯后学科数据保留

## [ ] Task 3: 创建学科管理弹窗组件
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建 SubjectManagerModal 组件
  - 显示学科列表，支持编辑和删除
  - 添加新学科表单（名称输入、emoji选择、颜色选择器）
  - 颜色选择器提供预设颜色选项
  - emoji选择器提供常用学习相关emoji
  - 保持森林系毛玻璃设计风格
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-3.1: 弹窗显示学科列表
  - `human-judgement` TR-3.2: 可以添加新学科
  - `human-judgement` TR-3.3: 可以编辑学科
  - `human-judgement` TR-3.4: 可以删除自定义学科
  - `human-judgement` TR-3.5: 内置学科没有删除按钮
  - `human-judgement` TR-3.6: 界面风格与应用一致

## [ ] Task 4: 在任务编辑弹窗中添加学科管理入口
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 在 TaskFormModal 的学科选择区域添加"管理"按钮
  - 点击打开学科管理弹窗
  - 管理完成后学科选择列表自动更新
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-4.1: 学科选择区域有管理按钮
  - `human-judgement` TR-4.2: 点击管理按钮打开学科管理弹窗
  - `human-judgement` TR-4.3: 管理后学科列表实时更新

## [ ] Task 5: 更新所有使用学科配置的组件
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 TaskListPage 中使用 SUBJECT_CONFIG 的地方
  - 修改 TaskCard 组件
  - 修改 TimelineView 组件
  - 修改 MonthCalendar 组件
  - 修改 AnalysisPage 及相关图表组件
  - 改为从 store 中动态获取学科配置
  - 提供 getSubjectConfig 辅助函数
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 任务卡片显示正确的学科颜色
  - `human-judgement` TR-5.2: 时间轴显示正确的学科颜色
  - `human-judgement` TR-5.3: 月历显示正确的学科颜色
  - `human-judgement` TR-5.4: 学科筛选功能正常
  - `human-judgement` TR-5.5: 新增/修改学科后各处同步更新

## [ ] Task 6: 验证修复效果
- **Priority**: medium
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 验证学科增删改功能
  - 验证各页面学科显示
  - 验证数据持久化
  - 验证导出导入功能
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-6.1: 完整流程测试通过
  - `human-judgement` TR-6.2: 数据持久化正常
  - `human-judgement` TR-6.3: 导出导入包含学科数据
