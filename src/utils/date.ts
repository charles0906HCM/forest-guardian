import type { Task, RepeatType } from "@/types";

// 生成唯一 ID
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 获取今天的 ISO 日期字符串 YYYY-MM-DD
export function todayISO(): string {
  return toISODate(new Date());
}

// Date 转 ISO 日期字符串
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 解析 ISO 日期字符串为 Date
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// 加天数
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// 两个日期相差天数
export function daysBetween(a: string, b: string): number {
  const da = fromISODate(a);
  const db = fromISODate(b);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

// 格式化日期为中文显示 "6月15日 周一"
export function formatChineseDate(s: string): string {
  const d = fromISODate(s);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

// 格式化日期为短显示 "06-15"
export function formatShortDate(s: string): string {
  const d = fromISODate(s);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}-${day}`;
}

// 判断任务在某日是否应该出现
export function isTaskActiveOnDate(task: Task, dateStr: string): boolean {
  const { startDate, repeatType, repeatEndDate } = task;
  // 日期早于开始日期
  if (dateStr < startDate) return false;
  // 非重复任务:仅在 startDate 当天
  if (repeatType === "none") {
    return dateStr === startDate;
  }
  // 重复任务:仅以 repeatEndDate 为结束边界(允许预览未来日期)
  if (repeatEndDate && dateStr > repeatEndDate) return false;

  const diff = daysBetween(startDate, dateStr);
  if (repeatType === "daily") {
    return diff >= 0;
  }
  if (repeatType === "weekly") {
    return diff >= 0 && diff % 7 === 0;
  }
  if (repeatType === "workday") {
    // 工作日:周一至周五 (getDay() 1-5)
    const dayOfWeek = fromISODate(dateStr).getDay();
    return diff >= 0 && dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (repeatType === "custom") {
    // 自定义:检查目标日期的星期是否在 repeatDays 数组中
    const dayOfWeek = fromISODate(dateStr).getDay();
    return diff >= 0 && (task.repeatDays ?? []).includes(dayOfWeek);
  }
  return false;
}

// 获取某日的任务列表(包含重复任务实例)
export function getTasksForDate(tasks: Task[], dateStr: string): Task[] {
  return tasks.filter((t) => isTaskActiveOnDate(t, dateStr));
}

// 判断任务在某日是否已完成
export function isTaskCompletedOnDate(task: Task, dateStr: string): boolean {
  return task.completedDates.includes(dateStr);
}

// 获取连续天数范围
export function getDateRange(start: string, end: string): string[] {
  const result: string[] = [];
  let cur = fromISODate(start);
  const endDate = fromISODate(end);
  while (cur <= endDate) {
    result.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return result;
}

// 获取给定日期所在周的日期范围(周一到周日)
export function getWeekRange(dateStr: string): { start: string; end: string; dates: string[] } {
  const d = fromISODate(dateStr);
  const dayOfWeek = d.getDay();
  const monday = addDays(d, dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const sunday = addDays(monday, 6);
  return {
    start: toISODate(monday),
    end: toISODate(sunday),
    dates: getDateRange(toISODate(monday), toISODate(sunday)),
  };
}

// 获取给定日期所在月的日期范围
export function getMonthRange(dateStr: string): { start: string; end: string; dates: string[] } {
  const d = fromISODate(dateStr);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: toISODate(firstDay),
    end: toISODate(lastDay),
    dates: getDateRange(toISODate(firstDay), toISODate(lastDay)),
  };
}

// 获取周的中文标题 "6月第2周"
export function formatWeekTitle(dateStr: string): string {
  const d = fromISODate(dateStr);
  const month = d.getMonth() + 1;
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekNum = Math.ceil((d.getDate() + offset) / 7);
  return `${month}月第${weekNum}周`;
}

// 获取月的中文标题 "2026年6月"
export function formatMonthTitle(dateStr: string): string {
  const d = fromISODate(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

// 获取某周/月的任务列表(去重)
export function getTasksForRange(tasks: Task[], startDate: string, endDate: string): Task[] {
  const result: Task[] = [];
  const taskIds = new Set<string>();
  const dates = getDateRange(startDate, endDate);
  dates.forEach((date) => {
    getTasksForDate(tasks, date).forEach((task) => {
      if (!taskIds.has(task.id)) {
        taskIds.add(task.id);
        result.push(task);
      }
    });
  });
  return result;
}

// 重复类型中文
export function repeatTypeLabel(r: RepeatType): string {
  return r === "none" ? "不重复" : r === "daily" ? "每日重复" : r === "weekly" ? "每周重复" : r === "workday" ? "工作日重复" : "自定义重复";
}
