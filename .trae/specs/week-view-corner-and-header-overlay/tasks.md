# Tasks

- [x] Task 1: 修复左上角"时间"标题格遮挡下方时间刻度的问题
  - [x] SubTask 1.1: 将"时间"标题格的 z-index 提升到高于时间列 sticky 元素
  - [x] SubTask 1.2: 为"时间"标题格设置不透明背景，确保遮挡效果
  - [x] SubTask 1.3: 在桌面浏览器验证滚动时时间刻度被标题格遮挡

- [x] Task 2: 修复 iPad 上周视图背景四角突出问题
  - [x] SubTask 2.1: 检查外层容器 `overflow-hidden` 与内部 sticky 元素的裁剪关系
  - [x] SubTask 2.2: 调整内部背景层，使其不超出外层 `rounded-2xl` 圆角范围
  - [x] SubTask 2.3: 在 iPad Safari 上验证四角无突出

# Task Dependencies
- Task 1 与 Task 2 可并行执行
