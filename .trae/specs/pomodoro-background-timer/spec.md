# 番茄钟后台计时与锁屏提醒 Spec

## Overview
- **Summary**: 实现番茄钟在 iPhone/iPad 锁屏后继续计时，通过系统通知显示实时倒计时，并在完成时播放提醒声音。
- **Purpose**: 解决移动端锁屏后番茄钟计时停止的问题，确保用户在锁屏状态下也能看到倒计时并收到完成提醒。
- **Target Users**: iPhone/iPad 用户，需要在锁屏状态下继续专注计时的用户。

## Goals
- iPhone/iPad 锁屏后番茄钟继续正常计时
- 锁屏时通过系统通知显示实时倒计时
- 计时完成时发送完成通知并播放提醒声音
- 解锁后能看到计时完成状态

## Non-Goals (Out of Scope)
- 不支持在锁屏界面显示自定义窗口（受 iOS 限制）
- 不支持在其他应用内弹出窗口

## Background & Context
- 当前使用 `setInterval` 实现计时器，在 iOS Safari 后台/锁屏时会暂停
- iOS Safari 对 Web 应用后台运行有严格限制，无法在锁屏时显示自定义窗口
- 可行方案：使用 Web Worker 保持计时，使用 Notification API 发送倒计时和完成通知
- 通知内容可以包含倒计时信息，但 iOS Safari 对通知更新频率有限制

## Functional Requirements
- **FR-1**: 使用 Web Worker 实现后台计时，不受页面状态影响
- **FR-2**: 在计时开始前请求浏览器通知权限
- **FR-3**: 计时过程中定期发送更新通知，显示当前倒计时
- **FR-4**: 计时完成时发送完成通知，播放提醒声音
- **FR-5**: 页面从后台返回时正确恢复计时状态

## Non-Functional Requirements
- **NFR-1**: 计时精度保持在 ±1 秒以内
- **NFR-2**: 在 iOS Safari 和 Android Chrome 上正常工作
- **NFR-3**: 通知权限被拒绝时不影响番茄钟正常运行

## Constraints
- **Technical**: iOS Safari 对后台运行和通知更新有严格限制
- **Business**: 需要用户授权通知权限才能发送提醒
- **Dependencies**: Notification API、Web Worker API

## Assumptions
- 用户会在计时开始前允许通知权限
- 用户了解 Web 应用在后台运行的限制

## Acceptance Criteria

### AC-1: 后台计时继续运行
- **Given**: 用户在 iPhone 上启动番茄钟计时后锁屏
- **When**: 锁屏期间计时进行中
- **Then**: 解锁后显示正确的剩余时间
- **Verification**: `human-judgment`

### AC-2: 锁屏时发送倒计时通知
- **Given**: 用户已授权通知权限并启动番茄钟计时
- **When**: 用户锁屏
- **Then**: 发送系统通知，显示当前倒计时（如"番茄专注: 24:30"）
- **Verification**: `human-judgment`

### AC-3: 计时完成发送通知并播放声音
- **Given**: 用户已授权通知权限并启动番茄钟计时
- **When**: 计时完成
- **Then**: 发送系统通知，显示"番茄专注完成！"及任务名称，并播放提醒声音
- **Verification**: `human-judgment`

### AC-4: 通知权限请求
- **Given**: 用户首次启动番茄钟
- **When**: 点击开始计时
- **Then**: 请求浏览器通知权限
- **Verification**: `human-judgment`

### AC-5: 解锁后显示完成状态
- **Given**: 锁屏期间计时完成
- **When**: 用户解锁屏幕
- **Then**: 页面显示计时完成状态，播放完成音效
- **Verification**: `human-judgment`
