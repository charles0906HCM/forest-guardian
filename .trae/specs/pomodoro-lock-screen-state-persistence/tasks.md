# 番茄钟锁屏状态持久化 - 实施计划

## [x] Task 1: 定义状态持久化接口和工具函数
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建 pomodoro 状态的类型定义（PomodoroState）
  - 实现 savePomodoroState 和 loadPomodoroState 工具函数
  - 实现 clearPomodoroState 函数用于清除状态
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-5
- **Test Requirements**:
  - `programmatic` TR-1.1: savePomodoroState 应将状态正确写入 localStorage，键名为 "pomodoro_state"
  - `programmatic` TR-1.2: loadPomodoroState 应能正确读取并解析 localStorage 中的状态
  - `programmatic` TR-1.3: clearPomodoroState 应能删除 localStorage 中的 "pomodoro_state" 键

## [x] Task 2: 页面隐藏时保存状态
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 添加 visibilitychange 事件监听器
  - 当 document.hidden=true 时，保存当前计时状态（running, secondsLeft, startTime）到 localStorage
  - startTime 使用 Date.now() 记录实际开始时间
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-2.1: 当页面隐藏时，localStorage["pomodoro_state"] 应包含 running、secondsLeft 和 startTime 字段
  - `programmatic` TR-2.2: startTime 应为有效的时间戳（Date.now() 返回值）

## [x] Task 3: 页面恢复可见时恢复状态
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 在 visibilitychange 事件中处理 document.hidden=false 的情况
  - 从 localStorage 读取保存的状态
  - 根据 startTime 和当前时间计算锁屏期间流逝的时间
  - 更新 secondsLeft 为正确的剩余时间
  - 如果之前正在运行，则重新启动计时器（Web Worker 或 setInterval）
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-3.1: 模拟锁屏 10 秒后恢复，剩余时间应减少约 10 秒
  - `human-judgment` TR-3.2: 如果之前正在运行，恢复后应继续自动计时

## [x] Task 4: 计时完成和重置时清除状态
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 handleFinish 函数中调用 clearPomodoroState
  - 在 handleReset 函数中调用 clearPomodoroState
  - 在组件卸载时（useEffect cleanup）清除状态
- **Acceptance Criteria Addressed**: AC-3, AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 计时完成后，localStorage["pomodoro_state"] 应为 undefined
  - `programmatic` TR-4.2: 点击重置按钮后，localStorage["pomodoro_state"] 应为 undefined

## [x] Task 5: 页面首次加载时恢复状态
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 在组件首次渲染时检查 localStorage 中是否有未完成的计时状态
  - 如果有，根据 startTime 和当前时间计算剩余时间并恢复状态
  - 如果之前正在运行，自动启动计时器
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-5.1: 关闭浏览器后重新打开，计时器应恢复到之前的状态
  - `human-judgment` TR-5.2: 如果之前正在运行，重新打开后应继续计时

## [x] Task 6: 暂停时保存状态
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 在 handlePause 函数中调用 savePomodoroState，保存 running=false 的状态
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 点击暂停按钮后，localStorage["pomodoro_state"] 应包含 running=false