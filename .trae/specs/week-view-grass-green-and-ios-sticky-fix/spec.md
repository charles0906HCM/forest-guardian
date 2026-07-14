# 周视图草绿色背景与iOS时间列修复 - Product Requirement Document

## Overview
- **Summary**: 优化周视图的视觉风格，将星期标题行、时间列、左上角"时间"格的背景色改为草绿色，与整体森林毛玻璃风格协调一致；同时修复iPhone Safari中周视图左右滑动到星期三之后时间列消失的兼容性问题。
- **Purpose**: 提升周视图的视觉一致性和用户体验，解决iOS设备上的显示bug。
- **Target Users**: 使用任务清单周视图的所有用户，尤其是iPhone/iPad用户。

## Goals
- 星期标题行、时间列、左上角"时间"格背景改为草绿色毛玻璃效果
- 草绿色背景需与整体森林主题协调，保持视觉层次感
- 修复iOS Safari中周视图左右滑动时时间列消失的问题
- 确保sticky固定元素在所有设备上都能正确显示

## Non-Goals (Out of Scope)
- 不修改日视图和月视图的背景样式
- 不改变周视图的整体布局结构
- 不修改任务卡片的样式
- 不涉及功能逻辑的修改

## Background & Context
- 当前周视图的sticky固定元素（星期标题行、时间列、左上角"时间"格）使用`bg-white/90 backdrop-blur-sm`白色半透明背景
- 森林主题色在tailwind.config.js中定义：`forest.light: "#7FB069"`（草绿色）、`forest.mid: "#3D7B52"`、`forest.deep: "#2D5F3F"`
- 整体背景为森林绿色渐变：`linear-gradient(160deg, #c9dfc8 0%, #a8c8b0 35%, #7fb069 70%, #5c8c56 100%)`
- iOS Safari对`position: sticky`在嵌套overflow容器中存在已知的兼容性问题，可能导致sticky元素在滚动到一定位置后消失
- 周视图代码位于`src/pages/TaskListPage.tsx`

## Functional Requirements
- **FR-1**: 星期标题行背景改为草绿色毛玻璃效果
- **FR-2**: 左侧时间列背景改为草绿色毛玻璃效果
- **FR-3**: 左上角"时间"单元格背景改为草绿色毛玻璃效果
- **FR-4**: 修复iOS Safari中周视图左右滑动时时间列消失的问题
- **FR-5**: 选中日的高亮背景在草绿色基础上叠加，保持可辨识性

## Non-Functional Requirements
- **NFR-1**: 草绿色背景的透明度和毛玻璃效果需与整体森林风格协调，保持视觉层次感
- **NFR-2**: 文字在草绿色背景上需保持良好的可读性
- **NFR-3**: iOS Safari上sticky元素需在整个滚动过程中保持可见
- **NFR-4**: 桌面端和其他浏览器不受影响，显示正常

## Constraints
- **Technical**: React + TypeScript + Tailwind CSS技术栈
- **Platform**: 需兼容桌面浏览器、iOS Safari（iPhone/iPad）
- **Dependencies**: 使用现有的森林主题颜色变量，不新增颜色

## Assumptions
- 使用`forest-light`（#7FB069）作为草绿色的基础色
- 毛玻璃效果继续使用`backdrop-blur-sm`，调整背景色透明度
- iOS sticky问题可通过添加-webkit前缀、硬件加速或调整布局结构解决

## Acceptance Criteria

### AC-1: 星期标题行草绿色背景
- **Given**: 用户在周视图页面
- **When**: 查看星期标题行（周一到周日）
- **Then**: 标题行背景为草绿色毛玻璃效果，与整体森林风格协调
- **Verification**: `human-judgment`
- **Notes**: 草绿色需与森林主题协调，文字保持清晰可读

### AC-2: 时间列草绿色背景
- **Given**: 用户在周视图页面
- **When**: 查看左侧时间列
- **Then**: 时间列背景为草绿色毛玻璃效果，与整体森林风格协调
- **Verification**: `human-judgment`
- **Notes**: 草绿色需与森林主题协调，时间文字保持清晰可读

### AC-3: 左上角"时间"格草绿色背景
- **Given**: 用户在周视图页面
- **When**: 查看左上角"时间"单元格
- **Then**: 单元格背景为草绿色毛玻璃效果，与星期标题行和时间列一致
- **Verification**: `human-judgment`
- **Notes**: 三个元素（标题行、时间列、左上角格）的背景色需保持一致

### AC-4: 选中日高亮可辨识
- **Given**: 用户在周视图页面，有选中的日期
- **When**: 查看选中日期的列标题
- **Then**: 选中日在草绿色背景基础上有可辨识的高亮效果
- **Verification**: `human-judgment`
- **Notes**: 高亮效果需在草绿色背景上仍然明显

### AC-5: iOS Safari时间列不消失
- **Given**: 用户使用iPhone Safari打开周视图
- **When**: 左右滑动查看周一到周日的所有日期
- **Then**: 左侧时间列在整个滑动过程中始终保持可见，不会在星期三之后消失
- **Verification**: `human-judgment`
- **Notes**: 需在真实iOS设备或iOS模拟器上验证

### AC-6: 桌面端显示正常
- **Given**: 用户使用桌面浏览器打开周视图
- **When**: 上下滚动和左右滑动
- **Then**: 所有sticky元素正常显示，草绿色背景正确，无回归问题
- **Verification**: `human-judgment`
- **Notes**: 确保修改不影响桌面端体验

## Open Questions
- 草绿色的具体透明度和毛玻璃强度是否需要调整？（默认使用类似白色背景的透明度比例，约80-90%不透明度）
