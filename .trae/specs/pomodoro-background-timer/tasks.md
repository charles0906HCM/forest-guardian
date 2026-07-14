# Tasks

- [x] Task 1: 创建 Web Worker 实现后台计时
  - [x] SubTask 1.1: 创建 pomodoro.worker.ts 文件
  - [x] SubTask 1.2: 实现 Worker 内部的倒计时逻辑
  - [x] SubTask 1.3: 实现主线程与 Worker 的通信

- [x] Task 2: 实现浏览器通知功能
  - [x] SubTask 2.1: 创建通知工具函数
  - [x] SubTask 2.2: 在计时开始时请求通知权限
  - [x] SubTask 2.3: 在计时完成时发送通知

- [x] Task 3: 集成到 PomodoroPage 组件
  - [x] SubTask 3.1: 修改 PomodoroPage 使用 Web Worker 计时
  - [x] SubTask 3.2: 添加通知权限请求和发送逻辑
  - [x] SubTask 3.3: 处理页面可见性变化时的计时恢复

# Task Dependencies
- Task 1 必须在 Task 3 之前完成
- Task 2 必须在 Task 3 之前完成
