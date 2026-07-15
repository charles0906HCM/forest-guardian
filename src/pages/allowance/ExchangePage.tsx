import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowLeft, Star, Zap, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import ForestBackground from "@/components/ForestBackground";

export default function ExchangePage() {
  const navigate = useNavigate();
  const balance = useAppStore((s) => s.balance);
  const allowanceSettings = useAppStore((s) => s.allowanceSettings);
  const exchangeStarCoins = useAppStore((s) => s.exchangeStarCoins);

  const rate = allowanceSettings.exchangeRate;
  const maxExchange = Math.floor(balance);
  const maxYuan = maxExchange / rate;

  const [starCoinAmount, setStarCoinAmount] = useState<number>(0);
  const [showEduModal, setShowEduModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState<"success" | "fail" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const yuanAmount = rate > 0 ? starCoinAmount / rate : 0;

  // 检查限额
  const limitExceeded = yuanAmount > allowanceSettings.singleExchangeLimit;
  const dailyLimitInfo = `单次上限 ${allowanceSettings.singleExchangeLimit.toFixed(2)} 元，每周上限 ${allowanceSettings.weeklyExchangeLimit.toFixed(2)} 元`;

  const handleExchangeAll = () => {
    setStarCoinAmount(maxExchange);
  };

  const handleStartExchange = () => {
    if (starCoinAmount <= 0) {
      setToast("请输入兑换数量");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (starCoinAmount > balance) {
      setToast("星愿币不足");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (limitExceeded) {
      setToast(`单次兑换不能超过 ${allowanceSettings.singleExchangeLimit.toFixed(2)} 元`);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setShowEduModal(true);
  };

  const handleConfirmExchange = () => {
    setShowEduModal(false);
    const ok = exchangeStarCoins(starCoinAmount);
    if (ok) {
      setShowResultModal("success");
      setStarCoinAmount(0);
    } else {
      setShowResultModal("fail");
    }
  };

  return (
    <>
      <ForestBackground />
      <div className="space-y-6">
        {/* 标题栏 */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <ArrowLeft size={20} className="text-forest-deep" />
          </button>
          <div>
            <h1 className="font-display text-3xl text-forest-deep text-shadow-forest flex items-center gap-2">
              <Star size={28} /> 兑换零用钱
            </h1>
            <p className="text-forest-bark mt-0.5 text-sm">用星愿币兑换零用钱</p>
          </div>
        </header>

        {/* 当前余额信息 */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-8xl opacity-15 animate-float-soft">⭐</div>
          <div className="relative space-y-4">
            <div>
              <div className="text-sm text-forest-bark font-medium">星愿币余额</div>
              <div className="flex items-end gap-2 mt-1">
                <span className="font-display text-4xl text-forest-deep drop-shadow-sm">
                  {balance}
                </span>
                <span className="text-lg mb-1">⭐</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/40 p-3 text-center border border-white/50">
                <div className="text-xs text-forest-bark">兑换汇率</div>
                <div className="font-display text-lg text-forest-mid mt-1">
                  {rate} ⭐ = 1 元
                </div>
              </div>
              <div className="rounded-2xl bg-white/40 p-3 text-center border border-white/50">
                <div className="text-xs text-forest-bark">可兑换</div>
                <div className="font-display text-lg text-[#52B788] mt-1">
                  {maxYuan.toFixed(2)} 元
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 兑换输入 */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-forest-deep">兑换星愿币数量</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min={0}
                max={maxExchange}
                value={starCoinAmount || ""}
                onChange={(e) => setStarCoinAmount(Math.max(0, Math.floor(Number(e.target.value))))}
                placeholder="输入数量"
                className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#4CC9F0]/40 text-forest-deep font-display text-xl"
              />
              <span className="text-lg">⭐</span>
            </div>
          </div>

          {/* 全部兑换 */}
          <button
            onClick={handleExchangeAll}
            disabled={maxExchange <= 0}
            className={clsx(
              "w-full py-2.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all",
              maxExchange > 0
                ? "bg-[#4CC9F0]/15 text-[#4CC9F0] hover:bg-[#4CC9F0]/25"
                : "bg-white/30 text-forest-bark cursor-not-allowed"
            )}
          >
            <Zap size={16} />
            全部兑换（{maxExchange} ⭐）
          </button>

          {/* 实时计算到账金额 */}
          <div className="rounded-2xl bg-white/40 p-4 border border-white/50 text-center">
            <div className="text-xs text-forest-bark">到账零用钱</div>
            <div className="font-display text-3xl text-forest-deep mt-1">
              {yuanAmount.toFixed(2)}
              <span className="text-sm ml-1 text-forest-bark">元</span>
            </div>
          </div>

          {/* 限额提示 */}
          {limitExceeded && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F77F00]/10 border border-[#F77F00]/30">
              <Info size={16} className="text-[#F77F00] flex-shrink-0 mt-0.5" />
              <span className="text-xs text-[#F77F00]">
                超出单次兑换上限 {allowanceSettings.singleExchangeLimit.toFixed(2)} 元
              </span>
            </div>
          )}

          <div className="text-[10px] text-forest-bark text-center">{dailyLimitInfo}</div>

          {/* 兑换按钮 */}
          <button
            onClick={handleStartExchange}
            disabled={starCoinAmount <= 0 || starCoinAmount > balance || limitExceeded}
            className={clsx(
              "w-full py-3 rounded-2xl font-medium text-white transition-all",
              starCoinAmount > 0 && starCoinAmount <= balance && !limitExceeded
                ? "bg-[#4CC9F0] hover:bg-[#4CC9F0]/90 active:scale-[0.98]"
                : "bg-white/40 text-forest-bark cursor-not-allowed"
            )}
          >
            确认兑换
          </button>
        </div>

        {/* 教育提示弹窗 */}
        {showEduModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
              onClick={() => setShowEduModal(false)}
            />
            <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up text-center">
              <div className="text-5xl mb-3">🌱</div>
              <h3 className="font-display text-xl text-forest-deep mb-2">兑换前想一想</h3>
              <p className="text-sm text-forest-bark mb-4">
                这是你通过努力打卡赚来的钱哦，想好怎么用了吗？
              </p>
              <p className="text-xs text-forest-mid mb-5">
                {starCoinAmount} ⭐ → {yuanAmount.toFixed(2)} 元零用钱
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowEduModal(false)}
                  className="py-2.5 rounded-2xl bg-white/40 text-forest-bark font-medium text-sm hover:bg-white/60 transition-colors"
                >
                  再想想
                </button>
                <button
                  onClick={handleConfirmExchange}
                  className="py-2.5 rounded-2xl bg-[#4CC9F0] text-white font-medium text-sm hover:bg-[#4CC9F0]/90 transition-colors"
                >
                  确定兑换
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 兑换结果弹窗 */}
        {showResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
              onClick={() => setShowResultModal(null)}
            />
            <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up text-center">
              {showResultModal === "success" ? (
                <>
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="font-display text-xl text-forest-deep mb-2">兑换成功！</h3>
                  <p className="text-sm text-forest-bark">
                    零用钱已经到账，记得合理使用哦
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">😔</div>
                  <h3 className="font-display text-xl text-forest-deep mb-2">兑换失败</h3>
                  <p className="text-sm text-forest-bark">
                    可能是余额不足或超出限额，请重试
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setShowResultModal(null);
                  if (showResultModal === "success") navigate("/allowance");
                }}
                className="w-full mt-5 py-2.5 rounded-2xl bg-[#4CC9F0] text-white font-medium text-sm hover:bg-[#4CC9F0]/90 transition-colors"
              >
                好的
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 animate-slide-up">
            <span className="font-medium text-forest-deep">{toast}</span>
          </div>
        )}
      </div>
    </>
  );
}
