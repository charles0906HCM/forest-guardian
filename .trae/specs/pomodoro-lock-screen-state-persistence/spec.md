# 番茄钟锁屏状态持久化 - 产品需求文档

## Overview
- **Summary**: 修复 iPhone 锁屏后再打开番茄钟页面恢复初始状态的问题，实现计时器状态的持久化保存和恢复
- **Purpose**: 确保用户在使用番茄钟专注计时时，即使锁屏或切换应用，计时器也能继续正常运行并保持正确状态
- **Target Users**: 使用 iPhone/iPad 移动端设备进行番茄专注的用户

## Goals
- 计时器状态（剩余秒数、运行状态、开始时间）在页面隐藏时保存到 localStorage
- 页面恢复可见时从 localStorage 恢复状态并计算正确的剩余时间
- 即使页面被浏览器完全卸载后重新加载，也能恢复到之前的计时状态

## Non-Goals (Out of Scope)
- 不修改 Web Worker 的核心计时逻辑
- 不改变现有的 UI 交互方式
- 不添加新的功能按钮或界面元素

## Background & Context
- 当前番茄钟使用 Web Worker 进行后台计时，但当 iPhone 锁屏后，浏览器会暂停页面执行，包括 Web Worker
- React 组件状态在页面重新加载时会丢失，导致计时器恢复到初始状态
- 用户期望锁屏期间计时继续进行，或至少能正确恢复到锁屏前的状态

## Functional Requirements
- **FR-1**: 页面隐藏时（visibilitychange 事件）保存计时器状态到 localStorage
- **FR-2**: 页面恢复可见时从 localStorage 读取状态并恢复计时
- **FR-3**: 根据锁屏期间的实际时间差计算正确的剩余秒数
- **FR-4**: 计时完成时清除 localStorage 中的状态

## Non-Functional Requirements
- **NFR-1**: 状态保存和恢复操作应在 100ms 内完成
- **NFR-2**: localStorage 存储的数据应使用合理的键名，避免与其他功能冲突
- **NFR-3**: 状态恢复后应立即继续计时（如果之前正在运行）

## Constraints
- **Technical**: 必须使用 localStorage 进行状态持久化（不依赖 Supabase）
- **Technical**: 需要处理浏览器时间校准问题
- **Dependencies**: 依赖现有的 Web Worker 计时机制

## Assumptions
- 用户设备的系统时钟是准确的
- localStorage 在用户会话期间是可用的
- 浏览器支持 visibilitychange 事件

## Acceptance Criteria

### AC-1: 页面隐藏时保存状态
- **Given**: 番茄钟正在运行（running=true），剩余时间为 1400 秒
- **When**: 用户按下锁屏按钮或切换到其他应用（触发 visibilitychange 事件，document.hidden=true）
- **Then**: localStorage 中应保存当前状态（running=true, secondsLeft=1400, startTime=时间戳）
- **Verification**: `programmatic`

### AC-2: 页面恢复可见时恢复状态
- **Given**: localStorage 中保存了计时状态（running=true, secondsLeft=1400, startTime=10秒前）
- **When**: 用户解锁屏幕或切换回应用（触发 visibilitychange 事件，document.hidden=false）
- **Then**: 计时器应恢复到正确的剩余时间（约 1390 秒）并继续运行
- **Verification**: `human-judgment`

### AC-3: 计时完成时清除状态
- **Given**: 计时器正在运行，剩余时间为 0
- **When**: 计时完成（finished=true）
- **Then**: localStorage 中的计时状态应被清除
- **Verification**: `programmatic`

### AC-4: 暂停时保存状态
- **Given**: 番茄钟正在运行，用户点击暂停按钮
- **When**: running 状态变为 false
- **Then**: localStorage 中应保存当前状态（running=false, secondsLeft=当前值）
- **Verification**: `programmatic`

### AC-5: 重置时清除状态
- **Given**: 用户点击重置按钮
- **When**: handleReset 函数执行
- **Then**: localStorage 中的计时状态应被清除
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要处理跨天计时的情况（开始计时在今天，锁屏后到第二天）
- [ ] 是否需要在页面首次加载时检查是否有未完成的计时状态