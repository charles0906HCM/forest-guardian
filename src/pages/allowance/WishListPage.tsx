import { useState } from "react";
import { clsx } from "clsx";
import { Plus, X, Target, TrendingUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { WishItem } from "@/types";

export default function WishListPage() {
  const wishItems = useAppStore((s) => s.wishItems);
  const wallet = useAppStore((s) => s.wallet);
  const addWishItem = useAppStore((s) => s.addWishItem);
  const updateWishProgress = useAppStore((s) => s.updateWishProgress);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailWish, setDetailWish] = useState<WishItem | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const handleSaveToWish = (wish: WishItem, amount: number) => {
    if (amount <= 0 || amount > wallet.saveBalance) return;
    const wasActive = wish.status === "active";
    updateWishProgress(wish.id, amount);
    const willComplete = wish.savedAmount + amount >= wish.targetAmount;
    if (wasActive && willComplete) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    }
    setDetailWish(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest flex items-center gap-2">
              <Target size={32} className="text-forest-mid" />
              愿望清单
            </h1>
            <p className="text-forest-bark mt-1 text-sm">设定储蓄目标，一步步实现愿望</p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="glass-btn py-2 px-4 text-sm flex items-center gap-1.5"
          >
            <Plus size={16} />
            新建愿望
          </button>
        </div>
      </header>

      {/* 储蓄金余额卡片 */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-8xl opacity-20">🏦</div>
        <div className="relative">
          <div className="text-sm text-forest-bark font-medium">可用储蓄金</div>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-display text-5xl text-forest-deep drop-shadow-sm">
              ¥{wallet.saveBalance.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-forest-bark mt-2">从储蓄金转存到愿望目标</p>
        </div>
      </div>

      {/* 愿望列表 */}
      <section>
        <h2 className="font-display text-xl text-forest-deep mb-3 flex items-center gap-2">
          <TrendingUp size={20} /> 我的愿望
        </h2>

        {wishItems.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-3">🌟</div>
            <p className="text-forest-bark text-sm">还没有愿望？设定一个储蓄目标吧！</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-primary mt-4 text-sm py-2 px-4"
            >
              <Plus size={14} className="inline mr-1" />
              新建愿望
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wishItems.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                onClick={() => setDetailWish(wish)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 庆祝效果 */}
      {celebrating && <CelebrationOverlay />}

      {/* 新建愿望弹窗 */}
      {addModalOpen && (
        <AddWishModal
          onClose={() => setAddModalOpen(false)}
          onSave={(title, targetAmount) => {
            addWishItem(title, targetAmount);
            setAddModalOpen(false);
          }}
        />
      )}

      {/* 愿望详情弹窗 */}
      {detailWish && (
        <WishDetailModal
          wish={detailWish}
          saveBalance={wallet.saveBalance}
          onClose={() => setDetailWish(null)}
          onSave={handleSaveToWish}
        />
      )}
    </div>
  );
}

function WishCard({ wish, onClick }: { wish: WishItem; onClick: () => void }) {
  const percent = wish.targetAmount > 0 ? Math.min(100, Math.round((wish.savedAmount / wish.targetAmount) * 100)) : 0;
  const remaining = Math.max(0, wish.targetAmount - wish.savedAmount);
  const daysEstimate = remaining > 0 && wish.savedAmount > 0
    ? Math.ceil(remaining / (wish.savedAmount / Math.max(1, Math.ceil((Date.now() - new Date(wish.createdAt).getTime()) / 86400000))))
    : null;

  return (
    <button
      onClick={onClick}
      className="glass-card p-4 w-full text-left group hover:shadow-glass-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg text-forest-deep truncate">{wish.title}</h3>
            <span
              className={clsx(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                wish.status === "completed"
                  ? "bg-forest-mid/20 text-forest-mid"
                  : "bg-sun-gold/20 text-sun-gold"
              )}
            >
              {wish.status === "completed" ? "已完成" : "进行中"}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-forest-bark mb-1">
              <span>¥{wish.savedAmount.toFixed(2)} / ¥{wish.targetAmount.toFixed(2)}</span>
              <span className="font-bold text-forest-mid">{percent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg, #2A9D8F, #06D6A0)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-forest-bark">
            {wish.status === "active" && remaining > 0 && (
              <span>还差 ¥{remaining.toFixed(2)}</span>
            )}
            {daysEstimate !== null && wish.status === "active" && (
              <span>预计 {daysEstimate} 天</span>
            )}
            {wish.status === "completed" && wish.completedAt && (
              <span>完成于 {new Date(wish.completedAt).toLocaleDateString("zh-CN")}</span>
            )}
          </div>
        </div>
        <div className="text-3xl opacity-40 group-hover:opacity-70 transition-opacity">
          {wish.status === "completed" ? "🎉" : "💫"}
        </div>
      </div>
    </button>
  );
}

function AddWishModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (title: string, targetAmount: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const handleSubmit = () => {
    const amount = parseFloat(targetAmount);
    if (!title.trim() || isNaN(amount) || amount <= 0) return;
    onSave(title.trim(), amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-forest-deep">✨ 新建愿望</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-forest-deep">物品名称 <span className="text-berry-red">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：乐高积木套装"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-mid/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-deep">目标金额（元）<span className="text-berry-red">*</span></label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="如：200"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-mid/50"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          className={clsx(
            "w-full mt-5 py-3 rounded-2xl font-medium transition-all",
            title.trim() && targetAmount && parseFloat(targetAmount) > 0
              ? "btn-primary"
              : "bg-white/30 text-forest-bark cursor-not-allowed"
          )}
        >
          保存愿望
        </button>
      </div>
    </div>
  );
}

function WishDetailModal({
  wish,
  saveBalance,
  onClose,
  onSave,
}: {
  wish: WishItem;
  saveBalance: number;
  onClose: () => void;
  onSave: (wish: WishItem, amount: number) => void;
}) {
  const [depositAmount, setDepositAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const percent = wish.targetAmount > 0 ? Math.min(100, Math.round((wish.savedAmount / wish.targetAmount) * 100)) : 0;
  const remaining = Math.max(0, wish.targetAmount - wish.savedAmount);
  const isCompleted = wish.status === "completed";

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setToast("请输入有效金额");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (amount > saveBalance) {
      setToast(`储蓄金不足，当前余额 ¥${saveBalance.toFixed(2)}`);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (amount > remaining) {
      setToast(`超出剩余目标金额，最多存入 ¥${remaining.toFixed(2)}`);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    onSave(wish, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-forest-deep">
            {isCompleted ? "🎉" : "💫"} {wish.title}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* 进度信息 */}
        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-forest-bark">已存金额</span>
            <span className="font-bold text-forest-deep">¥{wish.savedAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-forest-bark">目标金额</span>
            <span className="font-bold text-forest-deep">¥{wish.targetAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-forest-bark">完成进度</span>
            <span className="font-bold text-forest-mid">{percent}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/40 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                background: "linear-gradient(90deg, #2A9D8F, #06D6A0)",
              }}
            />
          </div>
          {isCompleted && wish.completedAt && (
            <div className="text-center text-sm text-forest-mid font-medium">
              🎉 完成于 {new Date(wish.completedAt).toLocaleDateString("zh-CN")}
            </div>
          )}
        </div>

        {/* 存入储蓄金 */}
        {!isCompleted && (
          <div className="border-t border-white/30 pt-4">
            <h4 className="text-sm font-medium text-forest-deep mb-2">存入储蓄金</h4>
            <p className="text-xs text-forest-bark mb-2">
              可用储蓄金：¥{saveBalance.toFixed(2)} ｜ 还差：¥{remaining.toFixed(2)}
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="输入金额"
                className="flex-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-mid/50"
              />
              <button
                onClick={handleDeposit}
                className="btn-primary text-sm py-2 px-4"
              >
                存入
              </button>
            </div>
            {/* 快捷金额 */}
            <div className="flex gap-2 mt-2">
              {[10, 20, 50].map((val) => (
                <button
                  key={val}
                  onClick={() => setDepositAmount(String(Math.min(val, remaining, saveBalance)))}
                  disabled={val > saveBalance || val > remaining}
                  className={clsx(
                    "flex-1 py-1.5 rounded-xl text-xs font-medium transition-all",
                    val <= saveBalance && val <= remaining
                      ? "bg-white/40 hover:bg-white/60 text-forest-deep"
                      : "bg-white/20 text-forest-bark/50 cursor-not-allowed"
                  )}
                >
                  ¥{Math.min(val, remaining, saveBalance)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="mt-3 text-center text-sm text-berry-red font-medium">{toast}</div>
        )}
      </div>
    </div>
  );
}

function CelebrationOverlay() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="animate-slide-up text-center">
        <div className="text-7xl animate-bounce">🎉</div>
        <p className="font-display text-2xl text-forest-deep mt-4 drop-shadow-lg">愿望达成！</p>
      </div>
      {/* 飘落的庆祝粒子 */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="absolute animate-leaf-fall text-2xl"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: "-5%",
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${2 + Math.random()}s`,
            ["--tw-leaf-drift" as string]: `${(Math.random() - 0.5) * 100}px`,
          }}
        >
          {["🎊", "✨", "🌟", "⭐", "💫"][i % 5]}
        </div>
      ))}
    </div>
  );
}
