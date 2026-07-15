// 任务所属四象限
export type Quadrant =
  | "important-urgent" // 重要且紧急
  | "important-not-urgent" // 重要不紧急
  | "not-important-urgent" // 不重要紧急
  | "not-important-not-urgent"; // 不重要不紧急

// 重复类型
export type RepeatType = "none" | "daily" | "weekly" | "workday" | "custom";

// 任务科目
export type Subject = string;

// 学科数据结构
export interface SubjectItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
  isBuiltIn: boolean;
}

// 根据颜色生成背景色
export function getSubjectBg(color: string): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0.18)`;
}

// 预设颜色
export const SUBJECT_COLOR_PRESETS = [
  "#457B9D",
  "#E63946",
  "#2A9D8F",
  "#F4A261",
  "#8D99AE",
  "#E76F51",
  "#6A4C93",
  "#1D3557",
  "#06D6A0",
  "#EF476F",
  "#FFD166",
  "#118AB2",
];

// 预设emoji
export const SUBJECT_EMOJI_PRESETS = [
  "📐",
  "📖",
  "🔤",
  "🌟",
  "🧮",
  "📝",
  "🎨",
  "🎵",
  "⚽",
  "🔬",
  "🌍",
  "📊",
  "✏️",
  "📚",
  "🎯",
  "🏃",
];

// 默认内置学科
export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: "math", label: "数学", emoji: "📐", color: "#457B9D", isBuiltIn: true },
  { id: "chinese", label: "语文", emoji: "📖", color: "#E63946", isBuiltIn: true },
  { id: "english", label: "英语", emoji: "🔤", color: "#2A9D8F", isBuiltIn: true },
  { id: "other", label: "其他", emoji: "🌟", color: "#8D99AE", isBuiltIn: true },
];

// "其他"学科的ID（用于删除迁移）
export const OTHER_SUBJECT_ID = "other";

// 交易类型
export type TransactionType =
  | "task"
  | "habit-good"
  | "habit-bad"
  | "reward"
  | "exam";

// 任务
export interface Task {
  id: string;
  name: string;
  quadrant: Quadrant;
  subject: Subject;
  startDate: string; // ISO 日期 YYYY-MM-DD
  endDate: string; // ISO 日期 YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  repeatType: RepeatType;
  repeatEndDate: string; // ISO 日期,无重复时可为空
  repeatDays: number[]; // 自定义重复的星期几(0=周日, 1=周一, ..., 6=周六)
  starCoins: number;
  pomodoroMinutes: number;
  // 按日期记录完成状态(ISO 日期字符串)
  completedDates: string[];
  createdAt: string;
  updatedAt: string;
}

// 番茄钟会话
export interface PomodoroSession {
  id: string;
  taskId: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string | null;
  completed: boolean;
}

// 星愿币交易记录
export interface StarCoinTransaction {
  id: string;
  type: TransactionType;
  sourceId: string;
  amount: number; // 正=获得,负=消费
  description: string;
  createdAt: string;
}

// 习惯
export interface Habit {
  id: string;
  name: string;
  type: "good" | "bad";
  coinAmount: number; // 好习惯正,坏习惯负
  icon: string;
  createdAt: string;
}

// 奖品
export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
  createdAt: string;
}

// 考试单科成绩
export interface ExamScore {
  id: string;
  subject: string; // 语文/数学/英语/科学
  score: number;
  fullScore: number;
  rank?: number;
}

// 考试记录
export interface ExamRecord {
  id: string;
  examName: string;
  examDate: string; // ISO 日期
  scores: ExamScore[];
  targetScore: number; // 目标得分率(%)
  rewardCoins: number; // 达成目标奖励星愿币
  rewardClaimed: boolean;
  createdAt: string;
}

// 应用数据
export interface AppData {
  tasks: Task[];
  subjects: SubjectItem[];
  habits: Habit[];
  rewards: Reward[];
  transactions: StarCoinTransaction[];
  pomodoroSessions: PomodoroSession[];
  examRecords: ExamRecord[];
  balance: number;
  waterLog: Record<string, number>;
  // 零用钱财商模块
  wallet: WalletAccount;
  allowanceTransactions: AllowanceTransaction[];
  wishItems: WishItem[];
  allowanceAchievements: AllowanceAchievement[];
  allowanceSettings: AllowanceSettings;
}

// 象限配置
export const QUADRANT_CONFIG: Record<
  Quadrant,
  { label: string; shortLabel: string; color: string; bg: string; emoji: string }
> = {
  "important-urgent": {
    label: "重要且紧急",
    shortLabel: "重要紧急",
    color: "#E76F51",
    bg: "rgba(231,111,81,0.18)",
    emoji: "🔥",
  },
  "important-not-urgent": {
    label: "重要不紧急",
    shortLabel: "重要不急",
    color: "#2A9D8F",
    bg: "rgba(42,157,143,0.18)",
    emoji: "🌱",
  },
  "not-important-urgent": {
    label: "不重要但紧急",
    shortLabel: "紧急不重要",
    color: "#F4A261",
    bg: "rgba(244,162,97,0.18)",
    emoji: "⚡",
  },
  "not-important-not-urgent": {
    label: "不重要不紧急",
    shortLabel: "日常小事",
    color: "#8D99AE",
    bg: "rgba(141,153,174,0.18)",
    emoji: "🍃",
  },
};

// ===== 零用钱财商模块 =====

// 零用钱交易类型
export type AllowanceTransactionType = "income" | "expense";

// 零用钱收入来源
export type IncomeSource = "exchange" | "parent" | "other";

// 零用钱支出分类
export type ExpenseCategory =
  | "学习用品"
  | "零食饮料"
  | "玩具娱乐"
  | "餐饮交通"
  | "礼物捐赠"
  | "其他";

// 消费心情
export type SpendMood = "happy" | "normal" | "regret";

// 审核状态
export type ReviewStatus = "pending" | "approved" | "rejected";

// 三金账户类型
export type AccountType = "consume" | "save" | "share";

// 钱包账户
export interface WalletAccount {
  totalBalance: number;      // 总余额（元）
  consumeBalance: number;    // 消费金余额
  saveBalance: number;       // 储蓄金余额
  shareBalance: number;      // 分享金余额
  totalEarned: number;       // 累计赚取
  totalSpent: number;        // 累计支出
}

// 零用钱交易记录
export interface AllowanceTransaction {
  id: string;
  type: AllowanceTransactionType;
  category: string;
  amount: number;            // 金额（元），正数
  title: string;             // 项目名称
  date: string;              // ISO日期
  remark: string;            // 备注
  mood: SpendMood | null;    // 消费心情
  source: IncomeSource | null; // 收入来源
  account: AccountType;      // 所属账户
  parentComment: string;     // 家长评语
  reviewStatus: ReviewStatus | null; // 审核状态
  createdAt: string;
}

// 愿望目标
export interface WishItem {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  status: "active" | "completed";
  createdAt: string;
  completedAt: string | null;
}

// 零用钱设置
export interface AllowanceSettings {
  exchangeRate: number;          // 兑换汇率：N星愿币=1元
  singleExchangeLimit: number;   // 单次兑换上限（元）
  dailyExchangeLimit: number;    // 每日兑换次数上限
  weeklyExchangeLimit: number;   // 每周兑换总金额上限（元）
  requireReview: boolean;        // 兑换是否需要审核
  consumeRatio: number;          // 消费金比例（0-1）
  saveRatio: number;             // 储蓄金比例（0-1）
  shareRatio: number;            // 分享金比例（0-1）
  alertThreshold: number;        // 消费预警阈值（元）
  parentPassword: string;        // 家长密码（4位数字）
}

// 成就徽章
export interface AllowanceAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardStarCoins: number;
  unlockedAt: string | null;
}

// 预设番茄钟时长(分钟)
export const POMODORO_PRESETS = [5, 10, 15, 25];
