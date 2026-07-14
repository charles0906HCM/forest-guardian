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
} from "@/types";
import { OTHER_SUBJECT_ID } from "@/types";
import { loadData, saveData } from "@/utils/storage";
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

  const today = todayISO();
  const initialTodayWaterCount = initialData.waterLog[today] || 0;

  return {
    ...initialData,

    todayWaterCount: initialTodayWaterCount,

    addTransaction,
    persist,

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
      });
    },
  };
});
