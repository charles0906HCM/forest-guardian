import { useState, useRef } from "react";
import { clsx } from "clsx";
import { Plus, Minus, Gift, Sparkles, TrendingUp, TrendingDown, X, Trash2, Download, Upload, Pencil } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/utils/date";
import { type Habit, type Reward } from "@/types";
import WaterCupIcon from "@/components/WaterCupIcon";
import EmptyCupIcon from "@/components/EmptyCupIcon";

const WATER_GOAL = 8;

export default function RewardsPage() {
  const balance = useAppStore((s) => s.balance);
  const transactions = useAppStore((s) => s.transactions);
  const todayWaterCount = useAppStore((s) => s.todayWaterCount);
  const habits = useAppStore((s) => s.habits);
  const rewards = useAppStore((s) => s.rewards);
  const triggerHabit = useAppStore((s) => s.triggerHabit);
  const cancelHabit = useAppStore((s) => s.cancelHabit);
  const redeemReward = useAppStore((s) => s.redeemReward);
  const addHabit = useAppStore((s) => s.addHabit);
  const updateHabit = useAppStore((s) => s.updateHabit);
  const addReward = useAppStore((s) => s.addReward);
  const updateReward = useAppStore((s) => s.updateReward);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const deleteReward = useAppStore((s) => s.deleteReward);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);

  const waterHabit = habits.find(h => h.name === "喝水");

  const handleWaterClick = (index: number) => {
    if (!waterHabit) return;
    if (index < todayWaterCount) {
      cancelHabit(waterHabit.id);
    } else {
      triggerHabit(waterHabit.id);
    }
  };

  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 统计
  const today = todayISO();
  const todayEarned = transactions
    .filter((t) => t.createdAt.startsWith(today) && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  );

  const goodHabits = habits.filter((h) => h.type === "good");
  const badHabits = habits.filter((h) => h.type === "bad");

  const handleRedeem = (rewardId: string, name: string, cost: number) => {
    if (balance < cost) {
      setToast(`星愿币不足,还差 ${cost - balance} 个`);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (confirm(`确定兑换「${name}」吗?将消耗 ${cost} 星愿币`)) {
      const ok = redeemReward(rewardId);
      if (ok) {
        setToast(`🎉 兑换成功!${name}`);
        setTimeout(() => setToast(null), 2500);
      }
    }
  };

  const handleTriggerHabit = (habit: Habit) => {
    triggerHabit(habit.id);
    setToast(
      habit.type === "good"
        ? `${habit.icon} 完成「${habit.name}」+${habit.coinAmount} 星愿币`
        : `${habit.icon} 记录「${habit.name}」${habit.coinAmount} 星愿币`
    );
    setTimeout(() => setToast(null), 2000);
  };

  const handleExport = async () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const fileName = `星愿森林_数据_${new Date().toISOString().slice(0, 10)}.json`;

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: "application/json" });
      try {
        await navigator.share({
          title: "星愿森林数据备份",
          files: [file],
        });
        setToast("📥 数据分享成功！");
        setTimeout(() => setToast(null), 2000);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Share failed, fallback to download", err);
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast("📥 数据导出成功!");
    setTimeout(() => setToast(null), 2000);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const success = importData(data);
      if (success) {
        setToast("📤 数据导入成功!");
      } else {
        setToast("❌ 数据导入失败,文件格式错误");
      }
      setTimeout(() => setToast(null), 2000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest flex flex-wrap items-center gap-1">
              ⭐ 星愿币乐园
              <div className="flex gap-0.5 ml-2">
                {Array.from({ length: Math.max(WATER_GOAL, todayWaterCount) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleWaterClick(i)}
                    className="p-0.5 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    {i < todayWaterCount ? (
                      <WaterCupIcon size={24} />
                    ) : (
                      <EmptyCupIcon size={24} />
                    )}
                  </button>
                ))}
              </div>
            </h1>
            <p className="text-forest-bark mt-1 text-sm">完成任务攒星愿币,兑换心仪奖品</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="glass-btn flex items-center gap-1.5 px-3 py-2 text-sm"
              title="导出数据"
            >
              <Download size={16} />
              导出
            </button>
            <button
              onClick={handleImport}
              className="glass-btn flex items-center gap-1.5 px-3 py-2 text-sm"
              title="导入数据"
            >
              <Upload size={16} />
              导入
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* 余额大卡片 */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 text-9xl opacity-20 animate-float-soft">🦌</div>
        <div className="relative">
          <div className="text-sm text-forest-bark font-medium">我的星愿币余额</div>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-display text-6xl text-forest-deep drop-shadow-sm">
              {balance}
            </span>
            <span className="text-2xl mb-2">⭐</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <StatPill label="今日获得" value={todayEarned} icon="📈" color="#2A9D8F" />
            <StatPill label="累计获得" value={totalEarned} icon="💎" color="#7FB069" />
            <StatPill label="已消费" value={totalSpent} icon="🎁" color="#F4A261" />
          </div>
        </div>
      </div>

      {/* 习惯管理 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-forest-deep flex items-center gap-2">
            <Sparkles size={20} /> 习惯管理
          </h2>
          <button
            onClick={() => {
              setEditingHabit(null);
              setHabitModalOpen(true);
            }}
            className="glass-btn py-2 px-3 text-sm"
          >
            <Plus size={14} className="inline mr-1" />
            新增习惯
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 好习惯 */}
          <div className="glass-card p-4">
            <h3 className="font-display text-forest-mid mb-3 flex items-center gap-1">
              <TrendingUp size={18} /> 好习惯奖励
            </h3>
            <div className="space-y-2">
              {goodHabits.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-forest-mid/10 group"
                >
                  {h.name === "喝水" ? <WaterCupIcon size={28} /> : <span className="text-2xl">{h.icon}</span>}
                  <span className="flex-1 text-sm font-medium text-forest-deep">{h.name}</span>
                  <span className="text-sm font-bold text-forest-mid">+{h.coinAmount}⭐</span>
                  <button
                    onClick={() => handleTriggerHabit(h)}
                    className="w-8 h-8 rounded-xl bg-forest-mid text-white flex items-center justify-center hover:bg-forest-deep transition-colors"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingHabit(h);
                      setHabitModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-forest-mid/20 text-forest-bark hover:text-forest-mid flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="w-7 h-7 rounded-lg hover:bg-berry-red/20 text-forest-bark hover:text-berry-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {goodHabits.length === 0 && (
                <p className="text-sm text-forest-bark text-center py-3">还没有好习惯</p>
              )}
            </div>
          </div>

          {/* 坏习惯 */}
          <div className="glass-card p-4">
            <h3 className="font-display text-berry-orange mb-3 flex items-center gap-1">
              <TrendingDown size={18} /> 坏习惯惩罚
            </h3>
            <div className="space-y-2">
              {badHabits.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-berry-orange/10 group"
                >
                  <span className="text-2xl">{h.icon}</span>
                  <span className="flex-1 text-sm font-medium text-forest-deep">{h.name}</span>
                  <span className="text-sm font-bold text-berry-red">{h.coinAmount}⭐</span>
                  <button
                    onClick={() => handleTriggerHabit(h)}
                    className="w-8 h-8 rounded-xl bg-berry-orange text-white flex items-center justify-center hover:bg-berry-red transition-colors"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingHabit(h);
                      setHabitModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-berry-orange/20 text-forest-bark hover:text-berry-orange flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="w-7 h-7 rounded-lg hover:bg-berry-red/20 text-forest-bark hover:text-berry-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {badHabits.length === 0 && (
                <p className="text-sm text-forest-bark text-center py-3">还没有坏习惯</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 奖品兑换 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-forest-deep flex items-center gap-2">
            <Gift size={20} /> 奖品兑换
          </h2>
          <button
            onClick={() => {
              setEditingReward(null);
              setRewardModalOpen(true);
            }}
            className="glass-btn py-2 px-3 text-sm"
          >
            <Plus size={14} className="inline mr-1" />
            新增奖品
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {rewards.map((r) => {
            const canAfford = balance >= r.cost;
            return (
              <div
                key={r.id}
                className={clsx(
                  "glass-card p-4 flex flex-col items-center text-center group relative",
                  !canAfford && "opacity-70"
                )}
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingReward(r);
                      setRewardModalOpen(true);
                    }}
                    className="w-6 h-6 rounded-lg hover:bg-forest-mid/20 text-forest-bark hover:text-forest-mid flex items-center justify-center"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="w-6 h-6 rounded-lg hover:bg-berry-red/20 text-forest-bark hover:text-berry-red flex items-center justify-center"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="text-4xl mb-2">{r.icon}</div>
                <h4 className="font-display text-sm text-forest-deep leading-tight">{r.name}</h4>
                <p className="text-[10px] text-forest-bark mt-1 line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-1 mt-2 font-bold text-sun-gold">
                  <span>⭐</span>
                  <span className="text-forest-deep">{r.cost}</span>
                </div>
                <button
                  onClick={() => handleRedeem(r.id, r.name, r.cost)}
                  disabled={!canAfford}
                  className={clsx(
                    "mt-3 w-full py-2 rounded-xl text-sm font-medium transition-all",
                    canAfford
                      ? "btn-gold py-2"
                      : "bg-white/40 text-forest-bark cursor-not-allowed"
                  )}
                >
                  {canAfford ? "兑换" : "不足"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 交易记录 */}
      <section>
        <h2 className="font-display text-xl text-forest-deep mb-3 flex items-center gap-2">
          📜 星愿币记录
        </h2>
        <div className="glass-card p-4 max-h-80 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-sm text-forest-bark text-center py-6">
              还没有星愿币记录,去完成任务吧!
            </p>
          ) : (
            <div className="space-y-1.5">
              {transactions.slice(0, 50).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{getTxIcon(tx.type)}</span>
                    <div className="min-w-0">
                      <div className="text-sm text-forest-deep truncate">{tx.description}</div>
                      <div className="text-[10px] text-forest-bark">
                        {new Date(tx.createdAt).toLocaleString("zh-CN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={clsx(
                      "font-bold text-sm",
                      tx.amount > 0 ? "text-forest-mid" : "text-berry-red"
                    )}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 animate-slide-up">
          <span className="font-medium text-forest-deep">{toast}</span>
        </div>
      )}

      {habitModalOpen && (
        <HabitFormModal
          editingHabit={editingHabit}
          onClose={() => setHabitModalOpen(false)}
          onSave={(h) => {
            if (editingHabit) {
              updateHabit(editingHabit.id, h);
            } else {
              addHabit(h);
            }
            setHabitModalOpen(false);
          }}
        />
      )}
      {rewardModalOpen && (
        <RewardFormModal
          editingReward={editingReward}
          onClose={() => setRewardModalOpen(false)}
          onSave={(r) => {
            if (editingReward) {
              updateReward(editingReward.id, r);
            } else {
              addReward(r);
            }
            setRewardModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white/40 p-3 text-center border border-white/50">
      <div className="text-xs text-forest-bark">{label}</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <span>{icon}</span>
        <span className="font-display text-xl" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function getTxIcon(type: string): string {
  switch (type) {
    case "task":
      return "✅";
    case "habit-good":
      return "🌟";
    case "habit-bad":
      return "⚠️";
    case "reward":
      return "🎁";
    case "exam":
      return "🏅";
    default:
      return "⭐";
  }
}

// 习惯新增弹窗
function HabitFormModal({
  editingHabit,
  onClose,
  onSave,
}: {
  editingHabit?: Habit | null;
  onClose: () => void;
  onSave: (h: Omit<Habit, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState(editingHabit?.name ?? "");
  const [type, setType] = useState<"good" | "bad">(editingHabit?.type ?? "good");
  const [coinAmount, setCoinAmount] = useState(editingHabit?.coinAmount ?? 2);
  const [icon, setIcon] = useState(editingHabit?.icon ?? "🌟");

  const ICONS = ["🌟", "📖", "🧹", "🌙", "💧", "🏃", "🥦", "📱", "🎮", "🍫", "😴", "🦷"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-forest-deep">
            {editingHabit ? "编辑习惯" : "新增习惯"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-forest-deep">类型</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  setType("good");
                  setCoinAmount(Math.abs(coinAmount));
                }}
                className={clsx(
                  "flex-1 py-2 rounded-xl border-2 font-medium text-sm",
                  type === "good"
                    ? "border-forest-mid bg-forest-mid/15 text-forest-deep"
                    : "border-transparent bg-white/30 text-forest-bark"
                )}
              >
                好习惯 +
              </button>
              <button
                onClick={() => {
                  setType("bad");
                  setCoinAmount(-Math.abs(coinAmount));
                }}
                className={clsx(
                  "flex-1 py-2 rounded-xl border-2 font-medium text-sm",
                  type === "bad"
                    ? "border-berry-orange bg-berry-orange/15 text-berry-red"
                    : "border-transparent bg-white/30 text-forest-bark"
                )}
              >
                坏习惯 -
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如:每天阅读30分钟"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">
              {type === "good" ? "奖励星愿币" : "扣除星愿币"}
            </label>
            <input
              type="number"
              min={1}
              value={Math.abs(coinAmount)}
              onChange={(e) =>
                setCoinAmount(type === "good" ? Math.max(1, Number(e.target.value)) : -Math.max(1, Number(e.target.value)))
              }
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">图标</label>
            <div className="grid grid-cols-6 gap-1.5 mt-1">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={clsx(
                    "aspect-square rounded-xl text-xl flex items-center justify-center border-2",
                    icon === ic ? "border-forest-mid bg-forest-mid/15" : "border-transparent bg-white/30"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => name.trim() && onSave({ name: name.trim(), type, coinAmount, icon })}
          className="w-full btn-primary mt-5"
        >
          {editingHabit ? "保存修改" : "保存"}
        </button>
      </div>
    </div>
  );
}

// 奖品新增弹窗
function RewardFormModal({
  editingReward,
  onClose,
  onSave,
}: {
  editingReward?: Reward | null;
  onClose: () => void;
  onSave: (r: { name: string; cost: number; icon: string; description: string }) => void;
}) {
  const [name, setName] = useState(editingReward?.name ?? "");
  const [cost, setCost] = useState(editingReward?.cost ?? 10);
  const [icon, setIcon] = useState(editingReward?.icon ?? "🎁");
  const [description, setDescription] = useState(editingReward?.description ?? "");

  const ICONS = ["🎁", "📺", "🎮", "🍦", "📚", "🎠", "🦁", "🚲", "🏀", "🎨", "🧩", "🍿"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-forest-deep">
            {editingReward ? "编辑奖品" : "新增奖品"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-forest-deep">奖品名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如:周末看电影"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">所需星愿币</label>
            <input
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(Math.max(1, Number(e.target.value)))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">描述</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="奖品说明"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">图标</label>
            <div className="grid grid-cols-6 gap-1.5 mt-1">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={clsx(
                    "aspect-square rounded-xl text-xl flex items-center justify-center border-2",
                    icon === ic ? "border-sun-gold bg-sun-gold/15" : "border-transparent bg-white/30"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => name.trim() && onSave({ name: name.trim(), cost, icon, description })}
          className="w-full btn-gold mt-5"
        >
          {editingReward ? "保存修改" : "保存"}
        </button>
      </div>
    </div>
  );
}
