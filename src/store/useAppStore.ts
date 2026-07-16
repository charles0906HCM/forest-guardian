import { create } from "zustand";
import type {
  AppData,
  Task,
  Habit,
  Reward,
  ExamRecord,
  StarCoinTransaction,
  TransactionType,
  SubjectItem,
  AllowanceTransaction,
  AllowanceSettings,
  SpendMood,
  IncomeSource,
  AccountType,
  WishItem,
} from "@/types";
import { OTHER_SUBJECT_ID } from "@/types";
import { loadData, saveData, migrateAllowanceTransactions } from "@/utils/storage";
import { genId, todayISO, isTaskCompletedOnDate } from "@/utils/date";
import { isTargetMet } from "@/utils/scoreStats";
import {
  pushData,
  pullData,
  subscribeSync,
  unsubscribeSync,
  generateSyncCode,
  getLocalSyncCode,
  setLocalSyncCode,
  clearLocalSyncCode,
  canSync,
  type SyncStatus,
} from "@/utils/sync";

interface AppStore extends AppData {
  todayWaterCount: number;

  // 任务相关
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedDates">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, dateStr?: string) => void;
  uncompleteTask: (id: string, dateStr?: string) => void;

  // 学科相关
  addSubject: (subject: Omit<SubjectItem, "id" | "isBuiltIn">) => void;
  updateSubject: (id: string, updates: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => boolean;

  // 习惯相关
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Pick<Habit, "name" | "coinAmount" | "icon" | "type">>) => void;
  deleteHabit: (id: string) => void;
  triggerHabit: (id: string) => void;
  cancelHabit: (id: string) => void;

  // 奖品相关
  addReward: (reward: Omit<Reward, "id" | "createdAt">) => void;
  updateReward: (id: string, updates: Partial<Pick<Reward, "name" | "cost" | "description" | "icon">>) => void;
  deleteReward: (id: string) => void;
  redeemReward: (id: string) => boolean;

  // 番茄钟相关
  recordPomodoro: (taskId: string, minutes: number) => void;

  // 成绩相关
  addExamRecord: (record: Omit<ExamRecord, "id" | "createdAt" | "rewardClaimed">) => string;
  deleteExamRecord: (id: string) => void;
  claimExamReward: (id: string) => void;

  // 内部
  addTransaction: (
    type: TransactionType,
    sourceId: string,
    amount: number,
    description: string
  ) => void;
  persist: () => void;

  // 零用钱相关
  exchangeStarCoins: (starCoinAmount: number) => boolean;
  addAllowanceTransaction: (transaction: Omit<AllowanceTransaction, "id" | "createdAt">) => void;
  recordExpense: (title: string, amount: number, category: string, account: AccountType | AccountType[], mood?: SpendMood, remark?: string) => void;
  recordIncome: (amount: number, source: IncomeSource, title: string) => void;
  updateAllowanceSettings: (settings: Partial<AllowanceSettings>) => void;
  reviewExchange: (transactionId: string, approved: boolean) => void;
  grantAllowance: (amount: number, reason: string) => void;
  addWishItem: (title: string, targetAmount: number) => void;
  updateWishProgress: (id: string, amount: number) => void;
  updateWishItem: (id: string, updates: Partial<Pick<WishItem, "title" | "targetAmount">>) => void;
  deleteWishItem: (id: string) => void;
  setMood: (transactionId: string, mood: SpendMood) => void;
  addParentComment: (transactionId: string, comment: string) => void;
  
  // 数据导出导入
  exportData: () => string;
  importData: (data: string) => boolean;

  // 云同步
  syncCode: string | null;
  syncStatus: SyncStatus;
  syncEnabled: boolean;
  createSyncRoom: () => Promise<string | null>;
  joinSyncRoom: (code: string) => Promise<boolean>;
  leaveSyncRoom: () => void;
  syncNow: () => Promise<boolean>;
  applyRemoteData: (data: AppData) => void;
}

export const useAppStore = create<AppStore>((set, get) => {
  const initialData = loadData();

  // 云同步推送（防抖）
  let syncTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleSyncPush = () => {
    if (!canSync() || !get().syncCode) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const s = get();
      if (s.syncCode && s.syncStatus !== "syncing") {
        pushData(
          {
            tasks: s.tasks,
            subjects: s.subjects,
            habits: s.habits,
            rewards: s.rewards,
            transactions: s.transactions,
            pomodoroSessions: s.pomodoroSessions,
            examRecords: s.examRecords,
            balance: s.balance,
            waterLog: s.waterLog,
            wallet: s.wallet,
            allowanceTransactions: s.allowanceTransactions,
            wishItems: s.wishItems,
            allowanceAchievements: s.allowanceAchievements,
            allowanceSettings: s.allowanceSettings,
          },
          s.syncCode
        ).catch(() => {
          set({ syncStatus: "error" });
        });
      }
    }, 2000);
  };

  // 合并云端数据与本地数据
  const mergeRemoteData = (remote: AppData): AppData => {
    const local = get();
    const calculatedBalance = (remote.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
    const defaults = loadData();
    const settings = remote.allowanceSettings ?? local.allowanceSettings ?? defaults.allowanceSettings;
    // 云端数据可能也是旧版格式，同步迁移
    const remoteAllowanceTransactions = remote.allowanceTransactions ?? local.allowanceTransactions ?? [];
    const hasOldIncome = remoteAllowanceTransactions.some(t => t.type === "income" && t.account === "consume" && !remoteAllowanceTransactions.some(s => s.type === "income" && s.account === "save"));
    const allowanceTransactions = hasOldIncome
      ? migrateAllowanceTransactions(remoteAllowanceTransactions, settings)
      : remoteAllowanceTransactions;
    return {
      tasks: remote.tasks || local.tasks,
      subjects: (remote.subjects && remote.subjects.length > 0 ? remote.subjects : local.subjects),
      habits: remote.habits || local.habits,
      rewards: remote.rewards || local.rewards,
      transactions: remote.transactions || local.transactions,
      pomodoroSessions: remote.pomodoroSessions || local.pomodoroSessions,
      examRecords: remote.examRecords || local.examRecords,
      balance: calculatedBalance,
      waterLog: remote.waterLog ?? local.waterLog ?? {},
      wallet: remote.wallet ?? local.wallet ?? defaults.wallet,
      allowanceTransactions,
      wishItems: remote.wishItems ?? local.wishItems ?? [],
      allowanceAchievements: remote.allowanceAchievements ?? local.allowanceAchievements ?? [],
      allowanceSettings: settings,
    };
  };

  // 持久化辅助
  const persist = () => {
    const s = get();
    saveData({
      tasks: s.tasks,
      subjects: s.subjects,
      habits: s.habits,
      rewards: s.rewards,
      transactions: s.transactions,
      pomodoroSessions: s.pomodoroSessions,
      examRecords: s.examRecords,
      balance: s.balance,
      waterLog: s.waterLog,
      wallet: s.wallet,
      allowanceTransactions: s.allowanceTransactions,
      wishItems: s.wishItems,
      allowanceAchievements: s.allowanceAchievements,
      allowanceSettings: s.allowanceSettings,
    });
    scheduleSyncPush();
  };

  const addTransaction = (
    type: TransactionType,
    sourceId: string,
    amount: number,
    description: string
  ) => {
    const tx: StarCoinTransaction = {
      id: genId(),
      type,
      sourceId,
      amount,
      description,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      transactions: [tx, ...s.transactions],
      balance: s.balance + amount,
    }));
  };

  // 星愿币兑换零用钱
  const exchangeStarCoins = (starCoinAmount: number): boolean => {
    const s = get();
    const settings = s.allowanceSettings;
    const rate = settings.exchangeRate;
    if (rate <= 0) return false;
    const yuanAmount = starCoinAmount / rate;

    // 检查余额
    if (starCoinAmount > s.balance) return false;

    // 检查单次限额
    if (yuanAmount > settings.singleExchangeLimit) return false;

    // 检查每日限额
    const today = todayISO();
    const todayExchanges = s.allowanceTransactions.filter(
      t => t.source === "exchange" && t.date === today && t.reviewStatus !== "rejected"
    );
    if (todayExchanges.length >= settings.dailyExchangeLimit) return false;

    // 检查每周限额
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekExchanges = s.allowanceTransactions.filter(
      t => t.source === "exchange" && t.date >= weekStartStr && t.reviewStatus !== "rejected"
    );
    const weekTotal = weekExchanges.reduce((sum, t) => sum + t.amount, 0);
    if (weekTotal + yuanAmount > settings.weeklyExchangeLimit) return false;

    // 扣减星愿币
    set({ balance: s.balance - starCoinAmount });
    
    // 记录星愿币交易（直接记录，不通过addTransaction避免重复扣减）
    const starCoinTx: StarCoinTransaction = {
      id: genId(),
      type: "habit-good",
      sourceId: "exchange",
      amount: -starCoinAmount,
      description: `兑换${yuanAmount.toFixed(2)}元零用钱`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ transactions: [starCoinTx, ...state.transactions] }));

    if (settings.requireReview) {
      // 待审核
      get().addAllowanceTransaction({
        type: "income",
        category: "星愿兑换",
        amount: yuanAmount,
        title: `星愿币兑换（待审核）`,
        date: today,
        remark: `${starCoinAmount}星愿币`,
        mood: null,
        source: "exchange",
        account: "consume",
        parentComment: "",
        reviewStatus: "pending",
      });
    } else {
      // 直接到账
      get().recordIncome(yuanAmount, "exchange", `星愿币兑换`);
    }

    persist();
    return true;
  };

  // 添加零用钱交易记录
  const addAllowanceTransactionImpl = (transaction: Omit<AllowanceTransaction, "id" | "createdAt">) => {
    set((s) => ({
      allowanceTransactions: [...s.allowanceTransactions, { ...transaction, id: genId(), createdAt: new Date().toISOString() }],
    }));
  };

  // 记录支出
  const recordExpense = (title: string, amount: number, category: string, account: AccountType | AccountType[], mood?: SpendMood, remark?: string) => {
    const s = get();
    const wallet = s.wallet;

    // 支持 Array<AccountType> 多账户依次扣款
    const accounts = Array.isArray(account) ? account : [account];
    let remainingAmount = amount;
    const walletUpdates: Record<string, number> = {};
    const accountBreakdown: string[] = [];
    // 记录每个账户的实际扣款金额，用于创建独立交易记录
    const deductPerAccount: { account: AccountType; amount: number }[] = [];

    for (const acc of accounts) {
      if (remainingAmount <= 0) break;
      const accBalance = acc === "consume" ? wallet.consumeBalance : acc === "save" ? wallet.saveBalance : wallet.shareBalance;
      if (accBalance <= 0) continue;
      const deduct = Math.min(accBalance, remainingAmount);
      walletUpdates[`${acc}Balance`] = Math.round((accBalance - deduct) * 100) / 100;
      const accLabel = acc === "consume" ? "消费金" : acc === "save" ? "储蓄金" : "分享金";
      accountBreakdown.push(`${accLabel}扣除${deduct.toFixed(2)}元`);
      deductPerAccount.push({ account: acc, amount: Math.round(deduct * 100) / 100 });
      remainingAmount = Math.round((remainingAmount - deduct) * 100) / 100;
    }

    // 如果还有剩余金额未扣完，说明总余额不足
    if (remainingAmount > 0) return;

    set({
      wallet: {
        ...wallet,
        ...walletUpdates,
        totalBalance: Math.round((wallet.totalBalance - amount) * 100) / 100,
        totalSpent: Math.round((wallet.totalSpent + amount) * 100) / 100,
      },
    });

    // 为每个被扣款的账户创建独立的支出记录，确保三金账户各自可见
    const today = todayISO();
    const now = new Date().toISOString();
    const breakdownText = accountBreakdown.join("，");
    const expenseTransactions: AllowanceTransaction[] = deductPerAccount.map((d) => ({
      id: genId(),
      type: "expense" as const,
      category,
      amount: d.amount,
      title,
      date: today,
      remark: remark ? `${remark}（${breakdownText}）` : breakdownText,
      mood: mood || null,
      source: null,
      account: d.account,
      parentComment: "",
      reviewStatus: null,
      createdAt: now,
    }));

    set((s) => ({
      allowanceTransactions: [...s.allowanceTransactions, ...expenseTransactions],
    }));

    persist();
  };

  // 记录收入（自动拆分三金）
  const recordIncome = (amount: number, source: IncomeSource, title: string) => {
    const s = get();
    const settings = s.allowanceSettings;
    const wallet = s.wallet;

    const consumeAmount = Math.round(amount * settings.consumeRatio * 100) / 100;
    const saveAmount = Math.round(amount * settings.saveRatio * 100) / 100;
    const shareAmount = Math.round((amount - consumeAmount - saveAmount) * 100) / 100; // 剩余归分享金，避免精度丢失

    set({
      wallet: {
        ...wallet,
        totalBalance: Math.round((wallet.totalBalance + amount) * 100) / 100,
        consumeBalance: Math.round((wallet.consumeBalance + consumeAmount) * 100) / 100,
        saveBalance: Math.round((wallet.saveBalance + saveAmount) * 100) / 100,
        shareBalance: Math.round((wallet.shareBalance + shareAmount) * 100) / 100,
        totalEarned: Math.round((wallet.totalEarned + amount) * 100) / 100,
      },
    });

    // 按三金比例创建独立的交易记录，每个账户各一条
    const category = source === "exchange" ? "星愿兑换" : source === "parent" ? "家长发放" : "其他收入";
    const today = todayISO();
    const now = new Date().toISOString();

    const incomeTransactions: AllowanceTransaction[] = [];
    if (consumeAmount > 0) {
      incomeTransactions.push({
        id: genId(), type: "income", category, amount: consumeAmount, title,
        date: today, remark: "", mood: null, source,
        account: "consume", parentComment: "", reviewStatus: null, createdAt: now,
      });
    }
    if (saveAmount > 0) {
      incomeTransactions.push({
        id: genId(), type: "income", category, amount: saveAmount, title,
        date: today, remark: "", mood: null, source,
        account: "save", parentComment: "", reviewStatus: null, createdAt: now,
      });
    }
    if (shareAmount > 0) {
      incomeTransactions.push({
        id: genId(), type: "income", category, amount: shareAmount, title,
        date: today, remark: "", mood: null, source,
        account: "share", parentComment: "", reviewStatus: null, createdAt: now,
      });
    }

    set((s) => ({
      allowanceTransactions: [...s.allowanceTransactions, ...incomeTransactions],
    }));

    persist();
  };

  // 更新零用钱设置
  const updateAllowanceSettings = (settings: Partial<AllowanceSettings>) => {
    set((s) => ({
      allowanceSettings: { ...s.allowanceSettings, ...settings },
    }));
    persist();
  };

  // 审核兑换
  const reviewExchange = (transactionId: string, approved: boolean) => {
    const s = get();
    const transaction = s.allowanceTransactions.find(t => t.id === transactionId);
    if (!transaction || transaction.reviewStatus !== "pending") return;

    if (approved) {
      // 审核通过：删除待审核记录，调用 recordIncome 创建三金分拆记录
      set({
        allowanceTransactions: s.allowanceTransactions.filter(t => t.id !== transactionId),
      });
      get().recordIncome(transaction.amount, "exchange", "星愿币兑换");
    } else {
      // 驳回，退还星愿币
      const starCoinAmount = Math.round(transaction.amount * s.allowanceSettings.exchangeRate);
      set({
        balance: s.balance + starCoinAmount,
        allowanceTransactions: s.allowanceTransactions.map(t =>
          t.id === transactionId ? { ...t, reviewStatus: "rejected" } : t
        ),
      });
    }
    persist();
  };

  // 家长发放零用钱
  const grantAllowance = (amount: number, reason: string) => {
    recordIncome(amount, "parent", reason || "家长发放零用钱");
  };

  // 添加愿望
  const addWishItem = (title: string, targetAmount: number) => {
    set((s) => ({
      wishItems: [...s.wishItems, {
        id: genId(),
        title,
        targetAmount,
        savedAmount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        completedAt: null,
      }],
    }));
    persist();
  };

  // 编辑愿望（修改名称或目标金额）
  const updateWishItem = (id: string, updates: Partial<Pick<WishItem, "title" | "targetAmount">>) => {
    set((s) => ({
      wishItems: s.wishItems.map(w => w.id === id ? { ...w, ...updates } : w),
    }));
    persist();
  };

  // 删除愿望
  const deleteWishItem = (id: string) => {
    set((s) => ({
      wishItems: s.wishItems.filter(w => w.id !== id),
    }));
    persist();
  };

  // 更新愿望进度
  const updateWishProgress = (id: string, amount: number) => {
    const s = get();
    const wish = s.wishItems.find(w => w.id === id);
    if (!wish) return;

    const newSavedAmount = Math.round((wish.savedAmount + amount) * 100) / 100;
    const isCompleted = newSavedAmount >= wish.targetAmount;

    set({
      wishItems: s.wishItems.map(w =>
        w.id === id ? {
          ...w,
          savedAmount: newSavedAmount,
          status: isCompleted ? "completed" : "active",
          completedAt: isCompleted ? new Date().toISOString() : null,
        } : w
      ),
    });
    persist();
  };

  // 设置消费心情
  const setMood = (transactionId: string, mood: SpendMood) => {
    set((s) => ({
      allowanceTransactions: s.allowanceTransactions.map(t =>
        t.id === transactionId ? { ...t, mood } : t
      ),
    }));
    persist();
  };

  // 家长添加评语
  const addParentComment = (transactionId: string, comment: string) => {
    set((s) => ({
      allowanceTransactions: s.allowanceTransactions.map(t =>
        t.id === transactionId ? { ...t, parentComment: comment } : t
      ),
    }));
    persist();
  };

  const today = todayISO();
  const initialTodayWaterCount = initialData.waterLog[today] || 0;

  return {
    ...initialData,

    todayWaterCount: initialTodayWaterCount,

    addTransaction,
    persist,
    exchangeStarCoins,
    addAllowanceTransaction: addAllowanceTransactionImpl,
    recordExpense,
    recordIncome,
    updateAllowanceSettings,
    reviewExchange,
    grantAllowance,
    addWishItem,
    updateWishProgress,
    updateWishItem,
    deleteWishItem,
    setMood,
    addParentComment,

    addSubject: (subject) => {
      const newSubject: SubjectItem = {
        ...subject,
        id: genId(),
        isBuiltIn: false,
      };
      set((s) => ({ subjects: [...s.subjects, newSubject] }));
      persist();
    },

    updateSubject: (id, updates) => {
      set((s) => ({
        subjects: s.subjects.map((sub) =>
          sub.id === id ? { ...sub, ...updates } : sub
        ),
      }));
      persist();
    },

    deleteSubject: (id) => {
      const subject = get().subjects.find((s) => s.id === id);
      if (!subject || subject.isBuiltIn) return false;

      set((s) => ({
        subjects: s.subjects.filter((sub) => sub.id !== id),
        tasks: s.tasks.map((t) =>
          t.subject === id ? { ...t, subject: OTHER_SUBJECT_ID } : t
        ),
      }));
      persist();
      return true;
    },

    addTask: (task) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: genId(),
        completedDates: [],
        repeatDays: task.repeatDays ?? [],
        createdAt: now,
        updatedAt: now,
      };
      set((s) => ({ tasks: [...s.tasks, newTask] }));
      persist();
    },

    updateTask: (id, updates) => {
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      }));
      persist();
    },

    deleteTask: (id) => {
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      persist();
    },

    completeTask: (id, dateStr) => {
      const d = dateStr ?? todayISO();
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === id && !isTaskCompletedOnDate(t, d)
            ? { ...t, completedDates: [...t.completedDates, d] }
            : t
        ),
      }));
      const task = get().tasks.find((t) => t.id === id);
      if (task && isTaskCompletedOnDate(task, d)) {
        addTransaction("task", id, task.starCoins, `完成任务「${task.name}」`);
      }
      persist();
    },

    uncompleteTask: (id, dateStr) => {
      const d = dateStr ?? todayISO();
      const task = get().tasks.find((t) => t.id === id);
      if (task && isTaskCompletedOnDate(task, d)) {
        // 撤销时扣回星愿币
        addTransaction("task", id, -task.starCoins, `取消完成「${task.name}」`);
      }
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === id ? { ...t, completedDates: t.completedDates.filter((x) => x !== d) } : t
        ),
      }));
      persist();
    },

    addHabit: (habit) => {
      const newHabit: Habit = { ...habit, id: genId(), createdAt: new Date().toISOString() };
      set((s) => ({ habits: [...s.habits, newHabit] }));
      persist();
    },

    updateHabit: (id, updates) => {
      set((s) => ({
        habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      }));
      persist();
    },

    deleteHabit: (id) => {
      set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
      persist();
    },

    triggerHabit: (id) => {
      const habit = get().habits.find((h) => h.id === id);
      if (!habit) return;
      addTransaction(
        habit.type === "good" ? "habit-good" : "habit-bad",
        id,
        habit.coinAmount,
        `${habit.type === "good" ? "好习惯" : "坏习惯"}「${habit.name}」`
      );
      if (habit.name === "喝水" || habit.icon === "💧") {
        const today = todayISO();
        set((s) => {
          const newCount = (s.waterLog[today] || 0) + 1;
          return {
            waterLog: {
              ...s.waterLog,
              [today]: newCount,
            },
            todayWaterCount: newCount,
          };
        });
      }
      persist();
    },

    cancelHabit: (id) => {
      const habit = get().habits.find((h) => h.id === id);
      if (!habit) return;
      addTransaction(
        habit.type === "good" ? "habit-good" : "habit-bad",
        id,
        -habit.coinAmount,
        `取消${habit.type === "good" ? "好习惯" : "坏习惯"}「${habit.name}」`
      );
      if (habit.name === "喝水" || habit.icon === "💧") {
        const today = todayISO();
        set((s) => {
          const newCount = Math.max(0, (s.waterLog[today] || 0) - 1);
          return {
            waterLog: {
              ...s.waterLog,
              [today]: newCount,
            },
            todayWaterCount: newCount,
          };
        });
      }
      persist();
    },

    addReward: (reward) => {
      const newReward: Reward = { ...reward, id: genId(), createdAt: new Date().toISOString() };
      set((s) => ({ rewards: [...s.rewards, newReward] }));
      persist();
    },

    updateReward: (id, updates) => {
      set((s) => ({
        rewards: s.rewards.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
      persist();
    },

    deleteReward: (id) => {
      set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) }));
      persist();
    },

    redeemReward: (id) => {
      const reward = get().rewards.find((r) => r.id === id);
      if (!reward) return false;
      if (get().balance < reward.cost) return false;
      addTransaction("reward", id, -reward.cost, `兑换奖品「${reward.name}」`);
      persist();
      return true;
    },

    recordPomodoro: (taskId, minutes) => {
      // 番茄钟完成仅记录会话,星愿币通过完成任务发放
      const session = {
        id: genId(),
        taskId,
        durationMinutes: minutes,
        startedAt: new Date(Date.now() - minutes * 60000).toISOString(),
        completedAt: new Date().toISOString(),
        completed: true,
      };
      set((s) => ({ pomodoroSessions: [session, ...s.pomodoroSessions] }));
      persist();
    },

    addExamRecord: (record) => {
      const id = genId();
      const newRecord: ExamRecord = {
        ...record,
        id,
        rewardClaimed: false,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ examRecords: [...s.examRecords, newRecord] }));
      // 若达成目标,自动发放星愿币
      if (isTargetMet(newRecord) && newRecord.rewardCoins > 0) {
        const updated = get().examRecords.find((r) => r.id === id);
        if (updated && !updated.rewardClaimed) {
          addTransaction(
            "exam",
            id,
            newRecord.rewardCoins,
            `考试「${newRecord.examName}」达成目标奖励`
          );
          set((s) => ({
            examRecords: s.examRecords.map((r) =>
              r.id === id ? { ...r, rewardClaimed: true } : r
            ),
          }));
        }
      }
      persist();
      return id;
    },

    deleteExamRecord: (id) => {
      set((s) => ({ examRecords: s.examRecords.filter((r) => r.id !== id) }));
      persist();
    },

    claimExamReward: (id) => {
      const record = get().examRecords.find((r) => r.id === id);
      if (!record || record.rewardClaimed) return;
      if (!isTargetMet(record)) return;
      addTransaction("exam", id, record.rewardCoins, `考试「${record.examName}」达成目标奖励`);
      set((s) => ({
        examRecords: s.examRecords.map((r) =>
          r.id === id ? { ...r, rewardClaimed: true } : r
        ),
      }));
      persist();
    },
    
    exportData: () => {
      const s = get();
      return JSON.stringify({
        tasks: s.tasks,
        subjects: s.subjects,
        habits: s.habits,
        rewards: s.rewards,
        transactions: s.transactions,
        pomodoroSessions: s.pomodoroSessions,
        examRecords: s.examRecords,
        balance: s.balance,
        waterLog: s.waterLog,
        wallet: s.wallet,
        allowanceTransactions: s.allowanceTransactions,
        wishItems: s.wishItems,
        allowanceAchievements: s.allowanceAchievements,
        allowanceSettings: s.allowanceSettings,
      }, null, 2);
    },
    
    importData: (dataStr) => {
      try {
        const data = JSON.parse(dataStr);
        const defaults = loadData();
        const today = todayISO();
        const waterLog = data.waterLog ?? {};
        const todayWaterCount = waterLog[today] || 0;
        set({
          tasks: data.tasks || [],
          subjects: data.subjects && data.subjects.length > 0 ? data.subjects : defaults.subjects,
          habits: data.habits || [],
          rewards: data.rewards || [],
          transactions: data.transactions || [],
          pomodoroSessions: data.pomodoroSessions || [],
          examRecords: data.examRecords || [],
          balance: data.balance || 0,
          waterLog,
          todayWaterCount,
          wallet: data.wallet ?? defaults.wallet,
          allowanceTransactions: data.allowanceTransactions ?? [],
          wishItems: data.wishItems ?? [],
          allowanceAchievements: data.allowanceAchievements ?? [],
          allowanceSettings: data.allowanceSettings ?? defaults.allowanceSettings,
        });
        persist();
        return true;
      } catch {
        return false;
      }
    },

    // 云同步
    syncCode: canSync() ? getLocalSyncCode() : null,
    syncStatus: (canSync() && getLocalSyncCode()) ? "connected" : "idle" as SyncStatus,
    syncEnabled: canSync(),

    createSyncRoom: async () => {
      if (!canSync()) return null;
      const code = generateSyncCode();
      const ok = await pushData(
        {
          tasks: get().tasks,
          subjects: get().subjects,
          habits: get().habits,
          rewards: get().rewards,
          transactions: get().transactions,
          pomodoroSessions: get().pomodoroSessions,
          examRecords: get().examRecords,
          balance: get().balance,
          waterLog: get().waterLog,
          wallet: get().wallet,
          allowanceTransactions: get().allowanceTransactions,
          wishItems: get().wishItems,
          allowanceAchievements: get().allowanceAchievements,
          allowanceSettings: get().allowanceSettings,
        },
        code
      );
      if (ok) {
        setLocalSyncCode(code);
        set({ syncCode: code, syncStatus: "connected" });
        subscribeSync(code, (remoteData) => {
          const merged = mergeRemoteData(remoteData);
          get().applyRemoteData(merged);
        });
        return code;
      }
      set({ syncStatus: "error" });
      return null;
    },

    joinSyncRoom: async (code) => {
      if (!canSync()) return false;
      set({ syncStatus: "syncing" });
      const result = await pullData(code);
      if (!result.data) {
        set({ syncStatus: "error" });
        return false;
      }
      setLocalSyncCode(code);
      set({ syncCode: code, syncStatus: "connected" });
      // 合并云端数据与本地数据
      const merged = mergeRemoteData(result.data);
      get().applyRemoteData(merged);
      subscribeSync(code, (remoteData) => {
        get().applyRemoteData(remoteData);
      });
      return true;
    },

    leaveSyncRoom: () => {
      clearLocalSyncCode();
      unsubscribeSync();
      set({ syncCode: null, syncStatus: "idle" });
    },

    syncNow: async () => {
      const code = get().syncCode;
      if (!code || !canSync()) return false;
      set({ syncStatus: "syncing" });

      // 先拉取云端数据并合并
      const result = await pullData(code);
      if (result.data) {
        const merged = mergeRemoteData(result.data);
        get().applyRemoteData(merged);
      }

      // 再推送合并后的本地数据
      const pushOk = await pushData(
        {
          tasks: get().tasks,
          subjects: get().subjects,
          habits: get().habits,
          rewards: get().rewards,
          transactions: get().transactions,
          pomodoroSessions: get().pomodoroSessions,
          examRecords: get().examRecords,
          balance: get().balance,
          waterLog: get().waterLog,
          wallet: get().wallet,
          allowanceTransactions: get().allowanceTransactions,
          wishItems: get().wishItems,
          allowanceAchievements: get().allowanceAchievements,
          allowanceSettings: get().allowanceSettings,
        },
        code
      );

      if (pushOk) {
        set({ syncStatus: "connected" });
      } else {
        set({ syncStatus: "error" });
      }
      return pushOk;
    },

    applyRemoteData: (data) => {
      const defaults = loadData();
      const today = todayISO();
      const waterLog = data.waterLog ?? {};
      const todayWaterCount = waterLog[today] || 0;
      set({
        tasks: data.tasks || [],
        subjects: data.subjects && data.subjects.length > 0 ? data.subjects : defaults.subjects,
        habits: data.habits || [],
        rewards: data.rewards || [],
        transactions: data.transactions || [],
        pomodoroSessions: data.pomodoroSessions || [],
        examRecords: data.examRecords || [],
        balance: data.balance || 0,
        waterLog,
        todayWaterCount,
        wallet: data.wallet ?? defaults.wallet,
        allowanceTransactions: data.allowanceTransactions ?? [],
        wishItems: data.wishItems ?? [],
        allowanceAchievements: data.allowanceAchievements ?? [],
        allowanceSettings: data.allowanceSettings ?? defaults.allowanceSettings,
        syncStatus: "connected",
      });
      // 同步后也保存到本地
      saveData({
        tasks: data.tasks || [],
        subjects: data.subjects && data.subjects.length > 0 ? data.subjects : defaults.subjects,
        habits: data.habits || [],
        rewards: data.rewards || [],
        transactions: data.transactions || [],
        pomodoroSessions: data.pomodoroSessions || [],
        examRecords: data.examRecords || [],
        balance: data.balance || 0,
        waterLog: data.waterLog ?? {},
        wallet: data.wallet ?? defaults.wallet,
        allowanceTransactions: data.allowanceTransactions ?? [],
        wishItems: data.wishItems ?? [],
        allowanceAchievements: data.allowanceAchievements ?? [],
        allowanceSettings: data.allowanceSettings ?? defaults.allowanceSettings,
      });
    },
  };
});
