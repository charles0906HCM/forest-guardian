# 周视图草绿色背景与iOS时间列修复 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 将周视图sticky元素背景改为草绿色毛玻璃效果
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将星期标题行背景从`bg-white/90`改为草绿色毛玻璃效果（使用`forest-light`色）
  - 将左侧时间列背景从`bg-white/90`改为草绿色毛玻璃效果
  - 将左上角"时间"单元格背景从`bg-white/90`改为草绿色毛玻璃效果
  - 调整选中日的高亮背景色，使其在草绿色背景上仍然可辨识
  - 保持`backdrop-blur-sm`毛玻璃效果
  - 确保文字在草绿色背景上有良好的可读性
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-6
- **Test Requirements**:
  - `human-judgement` TR-1.1: 星期标题行背景为草绿色毛玻璃效果，与森林主题协调
  - `human-judgement` TR-1.2: 时间列背景为草绿色毛玻璃效果，与森林主题协调
  - `human-judgement` TR-1.3: 左上角"时间"格背景为草绿色，与其他两个元素一致
  - `human-judgement` TR-1.4: 选中日高亮在草绿色背景上仍然明显可辨识
  - `human-judgement` TR-1.5: 所有文字在草绿色背景上清晰可读
  - `human-judgement` TR-1.6: 桌面端上下滚动和左右滑动时显示正常，无回归问题
- **Notes**: 
  - 建议使用`bg-forest-light/80`或类似的透明度，保持毛玻璃效果
  - 三个元素（标题行、时间列、左上角格）的背景色必须完全一致
  - 选中日高亮可考虑使用更深的绿色或更高的不透明度

## [x] Task 2: 修复iOS Safari中周视图时间列消失的问题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 分析iOS Safari中sticky元素在左右滑动到星期三之后消失的原因
  - 可能的解决方案包括：
    1. 添加`-webkit-sticky`前缀和`position: -webkit-sticky`
    2. 为sticky元素添加硬件加速（`transform: translateZ(0)`或`will-change: transform`）
    3. 调整overflow容器结构，确保sticky元素的包含块正确
    4. 检查z-index层级，确保sticky元素在最上层
    5. 使用`sticky`的同时确保父元素没有`transform`、`filter`、`perspective`等属性
  - 在iOS设备上验证修复效果
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `human-judgement` TR-2.1: iPhone Safari中周视图左右滑动时，时间列始终可见
  - `human-judgement` TR-2.2: 滑动到星期三、星期四、星期五、星期六、星期日时，时间列都不消失
  - `human-judgement` TR-2.3: 上下滚动时表头也保持正常显示
  - `human-judgement` TR-2.4: 桌面端浏览器不受影响，sticky行为正常
  - `human-judgement` TR-2.5: iPad Safari也正常显示（如可用）
- **Notes**: 
  - iOS Safari的sticky实现有很多已知bug，需要仔细调试
  - 常见原因是sticky元素在带有transform的父元素内失效
  - 也可能需要将时间列的sticky定位从内层移到外层容器
  - 建议先尝试添加硬件加速和-webkit前缀，如果不行再调整布局结构

# Task Dependencies
- 两个任务相互独立，可以并行执行，也可以按顺序执行
- Task 1（草绿色背景）和 Task 2（iOS sticky修复）都修改同一个文件（TaskListPage.tsx），建议先完成一个再做另一个，避免冲突
