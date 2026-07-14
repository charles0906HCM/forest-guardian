# 修复计划:重复任务日期显示 + 番茄钟提示音

## 问题概述

1. **Bug 1**:设定任务的重复选项和结束日期后,切换到相关日期(尤其是未来日期)没有显示任务
2. **Bug 2**:番茄钟选择任务后,结束专注时间没有提示音

## 当前状态分析

### Bug 1:重复任务日期过滤逻辑缺陷

核心函数 `isTaskActiveOnDate` 位于 `src/utils/date.ts` 第 57-79 行:

```typescript
export function isTaskActiveOnDate(task: Task, dateStr: string): boolean {
  const { startDate, endDate, repeatType, repeatEndDate } = task;
  if (dateStr < startDate) return false;
  if (repeatType === "none") {
    return dateStr === startDate;
  }
  if (endDate && dateStr > endDate) return false;   // 问题1
  if (repeatEndDate && dateStr > repeatEndDate) return false;
  if (dateStr > todayISO()) return false;            // 问题2
  ...
}
```

**两处缺陷:**

1. **`endDate` 拦截未来日期**:表单 `TaskFormModal.tsx` 第 162 行 `endDate: repeatType === "none" ? startDate : endDate`,其中 `endDate` state 默认值为 `todayISO()`(今天)。用户创建每日重复任务时若不修改"任务结束日期",`endDate` 等于今天,导致所有未来日期被 `dateStr > endDate` 拦截。对重复任务而言,`endDate` 与 `repeatEndDate` 语义重叠且产生冲突。

2. **`dateStr > todayISO()` 阻止未来日期预览**:第 69 行硬性阻止了任何未来日期显示任务。作为计划类应用,用户应当能预览"明天/下周有哪些重复任务",此限制不合理。

### Bug 2:番茄钟完成无提示音

`PomodoroPage.tsx` 第 88-97 行 `handleFinish` 仅调用 `recordPomodoro`、`completeTask`、触发星愿币动画,完全没有音频播放逻辑。项目中也不存在任何音频资源或音频工具函数。

## 修改方案

### 修改 1:修复 `isTaskActiveOnDate` 日期过滤逻辑

**文件**: `src/utils/date.ts` (第 57-79 行)

**改动**:
- 删除第 69 行 `if (dateStr > todayISO()) return false;` —— 允许预览未来重复任务
- 对重复任务,仅用 `repeatEndDate` 作为结束边界,忽略 `endDate`(`endDate` 仅对非重复任务有意义,但非重复任务已在前面 `return dateStr === startDate` 处理,所以 `endDate` 对过滤实际上无用)
- 将第 66 行改为 `if (repeatType !== "none" && repeatEndDate && dateStr > repeatEndDate) return false;` —— 重复任务只看 `repeatEndDate`
- 保留 `repeatEndDate` 为空时无限重复的行为

**修改后逻辑**:
```typescript
export function isTaskActiveOnDate(task: Task, dateStr: string): boolean {
  const { startDate, repeatType, repeatEndDate } = task;
  if (dateStr < startDate) return false;
  if (repeatType === "none") {
    return dateStr === startDate;
  }
  // 重复任务:仅以 repeatEndDate 为结束边界
  if (repeatEndDate && dateStr > repeatEndDate) return false;

  const diff = daysBetween(startDate, dateStr);
  if (repeatType === "daily") {
    return diff >= 0;
  }
  if (repeatType === "weekly") {
    return diff >= 0 && diff % 7 === 0;
  }
  return false;
}
```

### 修改 2:精简任务表单,移除重复任务的冗余 endDate 字段

**文件**: `src/components/TaskFormModal.tsx`

**改动**:
- 移除重复任务表单中的"任务结束日期"输入框(第 152-159 行的 `endDate` 输入),因为对重复任务而言只需 `repeatEndDate` 一个结束日期
- 保存时,对重复任务将 `endDate` 设为空字符串 `""`(避免遗留的 endDate 值干扰),保持类型兼容
- 保留 `repeatEndDate` 字段作为重复任务的唯一结束日期
- 调整第 162 行 `endDate: repeatType === "none" ? startDate : endDate` 为 `endDate: repeatType === "none" ? startDate : ""`

### 修改 3:番茄钟页同步修复今日任务过滤

**文件**: `src/pages/PomodoroPage.tsx` (第 17-26 行)

**改动**: 将内联的 `todayTasks` 过滤逻辑替换为复用 `getTasksForDate` 工具函数,确保与任务清单页过滤逻辑一致,避免同样的 endDate bug:

```typescript
import { getTasksForDate, todayISO, isTaskCompletedOnDate } from "@/utils/date";
// ...
const todayTasks = getTasksForDate(tasks, todayISO());
```

删除原有的 17-26 行内联过滤逻辑。

### 修改 4:新增提示音工具函数

**文件**: `src/utils/sound.ts` (新建)

**改动**: 使用 Web Audio API 合成提示音,无需外部音频文件,离线可用,与项目零依赖后端风格一致。播放一段柔和的三音上升提示音(森林风铃感):

```typescript
// 使用 Web Audio API 合成完成提示音(三音上升,森林风铃风格)
let audioCtx: AudioContext | null = null;

export function playFinishSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume();

    // 三音上升: C5(523.25) -> E5(659.25) -> G5(783.99)
    const notes = [
      { freq: 523.25, start: 0, dur: 0.2 },
      { freq: 659.25, start: 0.15, dur: 0.2 },
      { freq: 783.99, start: 0.3, dur: 0.4 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + note.start);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + note.start);
      osc.stop(ctx.currentTime + note.start + note.dur);
    });
  } catch {
    // 音频不可用时静默失败
  }
}
```

### 修改 5:番茄钟完成时播放提示音

**文件**: `src/pages/PomodoroPage.tsx`

**改动**:
- 导入 `playFinishSound`
- 在 `handleFinish` 函数(第 88-97 行)开头调用 `playFinishSound()`,与星愿币动画同步触发

```typescript
const handleFinish = useCallback(() => {
  if (!selectedTask) return;
  playFinishSound(); // 新增:播放完成提示音
  recordPomodoro(selectedTask.id, minutes);
  if (!taskCompleted) {
    completeTask(selectedTask.id, todayISO());
  }
  setCoinAnim(true);
  setTimeout(() => setCoinAnim(false), 2500);
}, [selectedTask, minutes, recordPomodoro, completeTask, taskCompleted]);
```

## 假设与决策

1. **提示音实现方式**:选用 Web Audio API 合成而非音频文件,因为项目为纯前端零后端,不引入外部资源,离线可用,且可自定义音色。这是最合理的默认选择。
2. **重复任务 endDate 字段处理**:不删除数据模型中的 `endDate` 字段(保持类型兼容),但对重复任务将其置空,过滤时忽略。已有数据中重复任务的 `endDate` 不再生效,但不影响功能。
3. **未来日期预览**:移除 `dateStr > todayISO()` 限制后,用户可预览任意未来日期的重复任务。未来日期的任务可正常显示但未完成(完成状态按日期独立记录),符合计划类应用预期。
4. **不修改历史数据**:不迁移已存储的任务数据,仅修改过滤逻辑。旧的重复任务若 `endDate` 等于今天,在新逻辑下不再被拦截,行为自动修正。

## 验证步骤

1. **Bug 1 验证**:
   - 创建一个每日重复任务,开始日期为今天,重复结束日期设为一周后
   - 在任务清单页点击右箭头切换到明天/后天 → 应显示该重复任务
   - 切换到重复结束日期之后的日期 → 不应显示
   - 切换到开始日期之前的日期 → 不应显示
   - 创建一个每周重复任务,验证间隔 7 天的日期才显示
   - 切换到过去日期 → 应正常显示历史任务

2. **Bug 2 验证**:
   - 进入番茄钟页,选择一个任务
   - 设置较短时长(如 1 分钟自定义,或直接等待)
   - 开始专注,倒计时归零后 → 应听到三音上升提示音
   - 同时应显示星愿币掉落动画和完成提示卡片
   - 浏览器控制台无报错

3. **类型检查**:运行 `npm run check` 确认无 TypeScript 错误
4. **回归验证**:任务清单页四象限网格、任务卡片完成状态、番茄钟任务选择列表均正常工作
