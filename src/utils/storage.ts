import type { AppData, AllowanceTransaction, AllowanceSettings } from "@/types";
import { DEFAULT_SUBJECTS } from "@/types";

const STORAGE_KEY = "forest-guard-data";

// 默认初始数据
export function getDefaultData(): AppData {
  return {
    tasks: [],
    subjects: [...DEFAULT_SUBJECTS],
    habits: [
      {
        id: "h1",
        name: "早起读书",
        type: "good",
        coinAmount: 3,
        icon: "📖",
        createdAt: new Date().toISOString(),
      },
      {
        id: "h2",
        name: "主动整理书桌",
        type: "good",
        coinAmount: 2,
        icon: "🧹",
        createdAt: new Date().toISOString(),
      },
      {
        id: "h3",
        name: "按时睡觉",
        type: "good",
        coinAmount: 2,
        icon: "🌙",
        createdAt: new Date().toISOString(),
      },
      {
        id: "h6",
        name: "喝水",
        type: "good",
        coinAmount: 1,
        icon: "💧",
        createdAt: new Date().toISOString(),
      },
      {
        id: "h4",
        name: "玩手机超时",
        type: "bad",
        coinAmount: -3,
        icon: "📱",
        createdAt: new Date().toISOString(),
      },
      {
        id: "h5",
        name: "挑食不吃蔬菜",
        type: "bad",
        coinAmount: -2,
        icon: "🥦",
        createdAt: new Date().toISOString(),
      },
    ],
    rewards: [
      {
        id: "r1",
        name: "看动画片30分钟",
        cost: 15,
        icon: "📺",
        description: "用星愿币兑换看动画片的时间",
        createdAt: new Date().toISOString(),
      },
      {
        id: "r2",
        name: "去公园玩耍",
        cost: 30,
        icon: "🎠",
        description: "周末去公园尽情玩耍一次",
        createdAt: new Date().toISOString(),
      },
      {
        id: "r3",
        name: "买一本新书",
        cost: 50,
        icon: "📚",
        description: "挑选一本喜欢的课外书",
        createdAt: new Date().toISOString(),
      },
      {
        id: "r4",
        name: "吃冰淇淋",
        cost: 10,
        icon: "🍦",
        description: "挑选喜欢的口味",
        createdAt: new Date().toISOString(),
      },
      {
        id: "r5",
        name: "玩电子游戏1小时",
        cost: 25,
        icon: "🎮",
        description: "畅玩一小时",
        createdAt: new Date().toISOString(),
      },
      {
        id: "r6",
        name: "去动物园",
        cost: 100,
        icon: "🦁",
        description: "看可爱的小动物",
        createdAt: new Date().toISOString(),
      },
    ],
    transactions: [],
    pomodoroSessions: [],
    examRecords: [],
    balance: 0,
    waterLog: {},
    wallet: {
      totalBalance: 0,
      consumeBalance: 0,
      saveBalance: 0,
      shareBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
    },
    allowanceTransactions: [],
    wishItems: [],
    allowanceAchievements: [],
    allowanceSettings: {
      exchangeRate: 10,
      singleExchangeLimit: 50,
      dailyExchangeLimit: 3,
      weeklyExchangeLimit: 100,
      requireReview: false,
      consumeRatio: 0.5,
      saveRatio: 0.3,
      shareRatio: 0.2,
      alertThreshold: 20,
      parentPassword: "0000",
    },
  };
}

// 迁移旧版收入记录：将 account="consume" 的收入按三金比例拆分为三条独立记录
export function migrateAllowanceTransactions(
  transactions: AllowanceTransaction[],
  settings: AllowanceSettings
): AllowanceTransaction[] {
  const consumeRatio = settings.consumeRatio;
  const saveRatio = settings.saveRatio;
  const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  return transactions.flatMap((t) => {
    if (t.type === "income" && t.account === "consume") {
      const consumeAmount = Math.round(t.amount * consumeRatio * 100) / 100;
      const saveAmount = Math.round(t.amount * saveRatio * 100) / 100;
      const shareAmount = Math.round((t.amount - consumeAmount - saveAmount) * 100) / 100;

      const split: AllowanceTransaction[] = [];
      if (consumeAmount > 0) split.push({ ...t, account: "consume", amount: consumeAmount });
      if (saveAmount > 0) split.push({ ...t, id: newId(), account: "save", amount: saveAmount });
      if (shareAmount > 0) split.push({ ...t, id: newId(), account: "share", amount: shareAmount });
      return split;
    }
    return [t];
  });
}

// 从 localStorage 读取
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as AppData & { dataVersion?: number };
    // 合并默认数据确保字段完整
    const defaults = getDefaultData();

    // 确保喝水习惯存在且在第一位
    let habits = parsed.habits ?? [];
    const waterIndex = habits.findIndex(h => h.name === "喝水");
    if (waterIndex === -1) {
      habits = [{
        id: "h6",
        name: "喝水",
        type: "good",
        coinAmount: 1,
        icon: "💧",
        createdAt: new Date().toISOString(),
      }, ...habits];
    } else if (waterIndex > 0) {
      const waterHabit = habits.splice(waterIndex, 1)[0];
      habits = [waterHabit, ...habits];
    }

    // 数据迁移 v2：将旧版收入记录（全部存在 consume 下）按三金比例拆分为三条独立记录
    let allowanceTransactions = parsed.allowanceTransactions ?? [];
    const dataVersion = parsed.dataVersion ?? 1;
    if (dataVersion < 2 && allowanceTransactions.length > 0) {
      const settings = parsed.allowanceSettings ?? defaults.allowanceSettings;
      allowanceTransactions = migrateAllowanceTransactions(allowanceTransactions, settings);
    }

    return {
      ...defaults,
      ...parsed,
      subjects: parsed.subjects && parsed.subjects.length > 0 ? parsed.subjects : defaults.subjects,
      habits,
      rewards: parsed.rewards ?? defaults.rewards,
      waterLog: parsed.waterLog ?? {},
      tasks: (parsed.tasks ?? []).map(t => ({ ...t, repeatDays: t.repeatDays ?? [] })),
      wallet: parsed.wallet ?? defaults.wallet,
      allowanceTransactions,
      wishItems: parsed.wishItems ?? [],
      allowanceAchievements: parsed.allowanceAchievements ?? [],
      allowanceSettings: parsed.allowanceSettings ?? defaults.allowanceSettings,
    };
  } catch {
    return getDefaultData();
  }
}

// 写入 localStorage
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, dataVersion: 2 }));
  } catch {
    // 存储满或隐私模式,忽略
  }
}
