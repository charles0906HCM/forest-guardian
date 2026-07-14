import type { ExamRecord } from "@/types";

// 计算单次考试得分率(%)
export function getRate(score: number, fullScore: number): number {
  if (fullScore <= 0) return 0;
  return Math.round((score / fullScore) * 1000) / 10;
}

// 计算单次考试总分
export function getTotal(record: ExamRecord): number {
  return record.scores.reduce((sum, s) => sum + s.score, 0);
}

// 计算单次考试总满分
export function getTotalFull(record: ExamRecord): number {
  return record.scores.reduce((sum, s) => sum + s.fullScore, 0);
}

// 计算单次考试总得分率
export function getTotalRate(record: ExamRecord): number {
  return getRate(getTotal(record), getTotalFull(record));
}

// 根据得分率获取等级
export function getGrade(rate: number): { label: string; color: string } {
  if (rate >= 90) return { label: "优秀", color: "#2A9D8F" };
  if (rate >= 80) return { label: "良好", color: "#7FB069" };
  if (rate >= 60) return { label: "及格", color: "#F4A261" };
  return { label: "加油", color: "#E76F51" };
}

// 按日期升序排序的考试记录
export function sortByDateAsc(records: ExamRecord[]): ExamRecord[] {
  return [...records].sort((a, b) => a.examDate.localeCompare(b.examDate));
}

// 获取所有出现过的科目
export function getAllSubjects(records: ExamRecord[]): string[] {
  const set = new Set<string>();
  records.forEach((r) => r.scores.forEach((s) => set.add(s.subject)));
  return Array.from(set);
}

// 科目颜色映射
const SUBJECT_COLORS: Record<string, string> = {
  语文: "#E76F51",
  数学: "#2A9D8F",
  英语: "#F4A261",
  科学: "#8D99AE",
};
export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? "#7FB069";
}

// 获取某科目历次得分率序列(按日期升序)
export function getSubjectTrend(
  records: ExamRecord[],
  subject: string
): { date: string; rate: number; examName: string }[] {
  return sortByDateAsc(records)
    .filter((r) => r.scores.some((s) => s.subject === subject))
    .map((r) => {
      const s = r.scores.find((s) => s.subject === subject)!;
      return { date: r.examDate, rate: getRate(s.score, s.fullScore), examName: r.examName };
    });
}

// 计算各科目平均得分率
export function getSubjectAverages(
  records: ExamRecord[]
): { subject: string; avgRate: number; count: number }[] {
  const subjects = getAllSubjects(records);
  return subjects.map((subject) => {
    const trend = getSubjectTrend(records, subject);
    const avg = trend.reduce((sum, t) => sum + t.rate, 0) / (trend.length || 1);
    return { subject, avgRate: Math.round(avg * 10) / 10, count: trend.length };
  });
}

// 计算最近一次相比上一次的进步幅度(按科目)
export function getProgress(
  records: ExamRecord[]
): { subject: string; change: number; latestRate: number; prevRate: number }[] {
  const subjects = getAllSubjects(records);
  return subjects
    .map((subject) => {
      const trend = getSubjectTrend(records, subject);
      if (trend.length < 2) return null;
      const latest = trend[trend.length - 1].rate;
      const prev = trend[trend.length - 2].rate;
      return {
        subject,
        latestRate: latest,
        prevRate: prev,
        change: Math.round((latest - prev) * 10) / 10,
      };
    })
    .filter((x): x is { subject: string; change: number; latestRate: number; prevRate: number } => x !== null);
}

// 判断考试是否达成目标(总得分率 >= 目标)
export function isTargetMet(record: ExamRecord): boolean {
  return getTotalRate(record) >= record.targetScore;
}
