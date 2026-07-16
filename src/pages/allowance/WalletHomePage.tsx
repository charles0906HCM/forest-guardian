import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, BookOpen, Settings, BarChart3, Target, Trophy, Shield, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import ForestBackground from "@/components/ForestBackground";
import type { AllowanceTransaction, AccountType } from "@/types";

const ACCOUNT_CONFIG: Record<AccountType, { label: string; color: string; icon: string }> = {
  consume: { label: "消费金", color: "#4361EE", icon: "🛒" },
  save: { label: "储蓄金", color: "#FFB703", icon: "🏦" },
  share: { label: "分享金", color: "#FF70A6", icon: "💝" },
};

const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  学习用品: "✏️",
  零食饮料: "🍬",
  玩具娱乐: "🎮",
  餐饮交通: "🚌",
  礼物捐赠: "🎁",
  其他: "📦",
};

export default function WalletHomePage() {
  const navigate = useNavigate();
  const wallet = useAppStore((s) => s.wallet);
  const allowanceTransactions = useAppStore((s) => s.allowanceTransactions);
  const wishItems = useAppStore((s) => s.wishItems);

  const recentTransactions = allowanceTransactions.slice(0, 8);

  // 消费反思提示：支出满24小时的记录弹出反思提示
  const [reflectionTx, setReflectionTx] = useState<AllowanceTransaction | null>(null);

  // 三金账户明细弹窗
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);

  useEffect(() => {
    const now = Date.now();
    const unreflected = allowanceTransactions.find((t) => {
      if (t.type !== "expense" || t.mood) return false;
      const elapsed = now - new Date(t.createdAt).getTime();
      return elapsed >= 24 * 60 * 60 * 1000 && elapsed < 48 * 60 * 60 * 1000;
    });
    if (unreflected) setReflectionTx(unreflected);
  }, [allowanceTransactions]);

  const totalBalance = wallet.totalBalance;
  const totalEarned = wallet.totalEarned;
  const totalSpent = wallet.totalSpent;
  const surplus = totalEarned - totalSpent;

  const activeWishes = wishItems.filter((w) => w.status === "active");

  return (
    <>
      <ForestBackground />
      <div className="space-y-6">
        {/* 标题 */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest flex items-center gap-2">
              <Wallet size={32} /> 我的零花钱
            </h1>
            <p className="text-forest-bark mt-1 text-sm">管理零花钱，学会理财小达人</p>
          </div>
          <button
            onClick={() => navigate("/allowance/parent-settings")}
            className="p-2 rounded-xl glass-btn hover:bg-white/40 transition-colors"
            title="家长设置"
          >
            <Settings size={20} className="text-forest-mid" />
          </button>
        </header>

        {/* 余额总览卡片 */}
        <div className="glass-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-9xl opacity-20 animate-float-soft">💰</div>
          <div className="relative">
            <div className="text-sm text-forest-bark font-medium">可用零用钱总额</div>
            <div className="flex items-end gap-2 mt-1">
              <span className="font-display text-5xl md:text-6xl text-forest-deep drop-shadow-sm">
                {totalBalance.toFixed(2)}
              </span>
              <span className="text-2xl mb-2">元</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <StatPill label="累计赚取" value={totalEarned} icon="📈" color="#52B788" />
              <StatPill label="累计支出" value={totalSpent} icon="📉" color="#F77F00" />
              <StatPill label="结余" value={surplus} icon="💎" color="#4CC9F0" />
            </div>
          </div>
        </div>

        {/* 三金账户分区 */}
        <section>
          <h2 className="font-display text-xl text-forest-deep mb-3 flex items-center gap-2">
            🏦 三金账户
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(["consume", "save", "share"] as AccountType[]).map((type) => {
              const config = ACCOUNT_CONFIG[type];
              const balance =
                type === "consume"
                  ? wallet.consumeBalance
                  : type === "save"
                  ? wallet.saveBalance
                  : wallet.shareBalance;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedAccount(type)}
                  className="glass-card p-4 text-center hover:scale-[1.02] transition-transform"
                >
                  <div className="text-3xl mb-1">{config.icon}</div>
                  <div className="text-xs font-medium" style={{ color: config.color }}>
                    {config.label}
                  </div>
                  <div className="font-display text-lg mt-1 text-forest-deep">
                    {balance.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-forest-bark">元</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 快捷操作区 */}
        <section>
          <h2 className="font-display text-xl text-forest-deep mb-3 flex items-center gap-2">
            ⚡ 快捷操作
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/allowance/add-record?mode=expense")}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(247,127,0,0.15)" }}>
                <ArrowUpRight size={24} color="#F77F00" />
              </div>
              <span className="text-sm font-medium text-forest-deep">记支出</span>
            </button>
            <button
              onClick={() => navigate("/allowance/add-record?mode=income")}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(82,183,136,0.15)" }}>
                <ArrowDownRight size={24} color="#52B788" />
              </div>
              <span className="text-sm font-medium text-forest-deep">记收入</span>
            </button>
            <button
              onClick={() => navigate("/allowance/exchange")}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(76,201,240,0.15)" }}>
                <RefreshCw size={24} color="#4CC9F0" />
              </div>
              <span className="text-sm font-medium text-forest-deep">兑换零用钱</span>
            </button>
          </div>
        </section>

        {/* 最近交易流水 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-forest-deep flex items-center gap-2">
              📜 最近交易
            </h2>
            <button
              onClick={() => navigate("/allowance/records")}
              className="text-sm text-forest-mid hover:text-forest-deep transition-colors flex items-center gap-1"
            >
              查看全部 <BookOpen size={14} />
            </button>
          </div>
          <div className="glass-card p-4">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-forest-bark text-center py-6">
                还没有交易记录，开始记账吧！
              </p>
            ) : (
              <div className="space-y-1.5">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">
                        {tx.type === "income"
                          ? "💰"
                          : EXPENSE_CATEGORY_ICONS[tx.category] || "📦"}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-forest-deep truncate">{tx.title}</div>
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
                        tx.type === "income" ? "text-[#52B788]" : "text-[#F77F00]"
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 消费反思提示 */}
        {reflectionTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
              onClick={() => setReflectionTx(null)}
            />
            <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up text-center">
              <div className="text-4xl mb-3">🤔</div>
              <h3 className="font-display text-lg text-forest-deep mb-2">消费反思时间</h3>
              <p className="text-sm text-forest-bark mb-1">
                你在 <span className="font-medium text-forest-deep">{reflectionTx.title}</span> 上花了{" "}
                <span className="font-medium text-[#F77F00]">{reflectionTx.amount.toFixed(2)}元</span>
              </p>
              <p className="text-sm text-forest-bark mb-4">现在回想一下，这笔花费值得吗？</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    useAppStore.getState().setMood(reflectionTx.id, "happy");
                    setReflectionTx(null);
                  }}
                  className="py-2 rounded-xl bg-[#52B788]/15 text-[#52B788] font-medium text-sm hover:bg-[#52B788]/25 transition-colors"
                >
                  😊 开心
                </button>
                <button
                  onClick={() => {
                    useAppStore.getState().setMood(reflectionTx.id, "normal");
                    setReflectionTx(null);
                  }}
                  className="py-2 rounded-xl bg-[#4CC9F0]/15 text-[#4CC9F0] font-medium text-sm hover:bg-[#4CC9F0]/25 transition-colors"
                >
                  😐 一般
                </button>
                <button
                  onClick={() => {
                    useAppStore.getState().setMood(reflectionTx.id, "regret");
                    setReflectionTx(null);
                  }}
                  className="py-2 rounded-xl bg-[#F77F00]/15 text-[#F77F00] font-medium text-sm hover:bg-[#F77F00]/25 transition-colors"
                >
                  😔 后悔
                </button>
              </div>
              <button
                onClick={() => setReflectionTx(null)}
                className="mt-3 text-xs text-forest-bark hover:text-forest-deep transition-colors"
              >
                稍后再说
              </button>
            </div>
          </div>
        )}

        {/* 三金账户明细弹窗 */}
        {selectedAccount && (
          <AccountDetailModal
            account={selectedAccount}
            transactions={allowanceTransactions}
            onClose={() => setSelectedAccount(null)}
          />
        )}

        {/* 机会成本提示：存在进行中愿望 */}
        {activeWishes.length > 0 && (
          <div className="glass-card p-4 border-l-4 border-[#FFB703]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌟</span>
              <span className="text-sm font-medium text-forest-deep">心愿储蓄中</span>
            </div>
            <p className="text-xs text-forest-bark">
              你正在为「{activeWishes[0].title}」攒钱（{activeWishes[0].savedAmount.toFixed(2)}/{activeWishes[0].targetAmount.toFixed(2)}元），花每一笔前想想心愿哦！
            </p>
          </div>
        )}

        {/* 功能入口区 */}
        <section>
          <h2 className="font-display text-xl text-forest-deep mb-3 flex items-center gap-2">
            🗺️ 更多功能
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/allowance/analysis")}
              className="glass-card p-3 flex flex-col items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <BarChart3 size={22} className="text-[#4CC9F0]" />
              <span className="text-xs font-medium text-forest-deep">财商分析</span>
            </button>
            <button
              onClick={() => navigate("/allowance/wishes")}
              className="glass-card p-3 flex flex-col items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Target size={22} className="text-[#FFB703]" />
              <span className="text-xs font-medium text-forest-deep">愿望清单</span>
            </button>
            <button
              onClick={() => navigate("/allowance/achievements")}
              className="glass-card p-3 flex flex-col items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Trophy size={22} className="text-[#E76F51]" />
              <span className="text-xs font-medium text-forest-deep">成就徽章</span>
            </button>
            <button
              onClick={() => navigate("/allowance/parent-manage")}
              className="glass-card p-3 flex flex-col items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Shield size={22} className="text-[#457B9D]" />
              <span className="text-xs font-medium text-forest-deep">家长管理</span>
            </button>
          </div>
        </section>
      </div>
    </>
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
          {value.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function AccountDetailModal({
  account,
  transactions,
  onClose,
}: {
  account: AccountType;
  transactions: AllowanceTransaction[];
  onClose: () => void;
}) {
  const config = ACCOUNT_CONFIG[account];
  // 按账户分配明细筛选：只显示该账户有实际金额变动的交易
  const accountTransactions = transactions
    .filter((t) => {
      // 优先使用 accountSplits 精确匹配
      if (t.accountSplits) {
        return t.accountSplits[account] > 0;
      }
      // 兼容旧数据：无 accountSplits 时按 account 字段匹配
      return t.account === account;
    })
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-forest-deep flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            {config.label}明细
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/40 transition-colors"
            title="关闭"
          >
            <X size={18} className="text-forest-mid" />
          </button>
        </div>

        {/* 交易列表 */}
        {accountTransactions.length === 0 ? (
          <p className="text-sm text-forest-bark text-center py-8">
            还没有交易记录
          </p>
        ) : (
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {accountTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">
                    {tx.type === "income"
                      ? "💰"
                      : EXPENSE_CATEGORY_ICONS[tx.category] || "📦"}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-forest-deep truncate">
                      {tx.title}
                    </div>
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
                    tx.type === "income"
                      ? "text-[#52B788]"
                      : "text-[#F77F00]"
                  )}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {(tx.accountSplits ? tx.accountSplits[account] : tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
