import { useState } from "react";
import { CheckCircle2, XCircle, MessageSquare, Send, AlertTriangle, Wallet } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { AllowanceTransaction } from "@/types";
import ParentPasswordPage from "./ParentPasswordPage";

export default function ParentManagePage() {
  const allowanceTransactions = useAppStore((s) => s.allowanceTransactions);
  const settings = useAppStore((s) => s.allowanceSettings);
  const reviewExchange = useAppStore((s) => s.reviewExchange);
  const addParentComment = useAppStore((s) => s.addParentComment);
  const grantAllowance = useAppStore((s) => s.grantAllowance);

  const [verified, setVerified] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 家长评语状态
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // 手动发放零用钱
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  if (!verified) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
            📋 家长管理
          </h1>
          <p className="text-forest-bark mt-1 text-sm">审核兑换、查看交易、发放零用钱</p>
        </header>
        <ParentPasswordPage onVerified={() => setVerified(true)} />
      </div>
    );
  }

  // 待审核列表
  const pendingTransactions = allowanceTransactions.filter(
    (t) => t.reviewStatus === "pending"
  );

  // 消费预警记录
  const alertTransactions = allowanceTransactions.filter(
    (t) => t.type === "expense" && t.amount >= settings.alertThreshold && settings.alertThreshold > 0
  );

  const handleReview = (id: string, approved: boolean) => {
    reviewExchange(id, approved);
    showToast(approved ? "✅ 审核通过，零用钱已到账" : "❌ 已驳回，星愿币已退还");
  };

  const handleSubmitComment = (id: string) => {
    if (!commentText.trim()) return;
    addParentComment(id, commentText.trim());
    setCommentingId(null);
    setCommentText("");
    showToast("💬 评语已添加");
  };

  const handleGrant = () => {
    const amount = Number(grantAmount);
    if (!amount || amount <= 0) {
      showToast("请输入有效金额");
      return;
    }
    grantAllowance(amount, grantReason.trim() || "家长发放零用钱");
    setGrantOpen(false);
    setGrantAmount("");
    setGrantReason("");
    showToast(`💰 已发放 ¥${amount.toFixed(2)} 零用钱`);
  };

  const formatAmount = (t: AllowanceTransaction) => {
    return t.type === "income" ? `+¥${t.amount.toFixed(2)}` : `-¥${t.amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
          📋 家长管理
        </h1>
        <p className="text-forest-bark mt-1 text-sm">审核兑换、查看交易、发放零用钱</p>
      </header>

      {/* 手动发放零用钱 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-forest-mid" />
          发放零用钱
        </h2>
        {!grantOpen ? (
          <button
            onClick={() => setGrantOpen(true)}
            className="btn-gold dew-hover flex items-center gap-2"
          >
            <Send size={16} />
            手动发放
          </button>
        ) : (
          <div className="space-y-3 animate-slide-up">
            <div>
              <label className="text-sm text-forest-bark mb-1 block">金额（元）</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={grantAmount}
                onChange={(e) => setGrantAmount(e.target.value)}
                placeholder="输入金额"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
              />
            </div>
            <div>
              <label className="text-sm text-forest-bark mb-1 block">原因</label>
              <input
                type="text"
                value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                placeholder="如：本周零用钱、生日红包"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setGrantOpen(false); setGrantAmount(""); setGrantReason(""); }} className="flex-1 glass-btn">
                取消
              </button>
              <button onClick={handleGrant} className="flex-1 btn-gold dew-hover">
                确认发放
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 待审核兑换 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-sun-gold" />
          待审核兑换
          {pendingTransactions.length > 0 && (
            <span className="ml-auto text-xs bg-sun-gold/20 text-forest-bark px-2 py-0.5 rounded-full">
              {pendingTransactions.length} 条
            </span>
          )}
        </h2>
        {pendingTransactions.length === 0 ? (
          <p className="text-sm text-forest-bark text-center py-4">暂无待审核兑换</p>
        ) : (
          <div className="space-y-3">
            {pendingTransactions.map((t) => (
              <div key={t.id} className="p-3 rounded-2xl bg-white/30 border border-white/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-forest-deep">{t.title}</span>
                  <span className="text-sm font-bold text-sun-gold">¥{t.amount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-forest-bark mb-3">
                  {t.remark && <span className="mr-2">{t.remark}</span>}
                  <span>{t.date}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(t.id, true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-2xl bg-forest-mid/15 text-forest-mid hover:bg-forest-mid/25 transition-all text-sm font-medium"
                  >
                    <CheckCircle2 size={14} />
                    通过
                  </button>
                  <button
                    onClick={() => handleReview(t.id, false)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-2xl bg-berry-red/15 text-berry-red hover:bg-berry-red/25 transition-all text-sm font-medium"
                  >
                    <XCircle size={14} />
                    驳回
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 全部交易记录 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          📊 全部交易记录
          <span className="ml-auto text-xs text-forest-bark">{allowanceTransactions.length} 条</span>
        </h2>
        {allowanceTransactions.length === 0 ? (
          <p className="text-sm text-forest-bark text-center py-4">暂无交易记录</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allowanceTransactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((t) => (
              <div key={t.id} className="p-3 rounded-2xl bg-white/30 border border-white/40">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-forest-deep truncate">{t.title}</span>
                      {t.reviewStatus === "pending" && (
                        <span className="text-xs bg-sun-gold/20 text-forest-bark px-1.5 py-0.5 rounded-full flex-shrink-0">待审</span>
                      )}
                      {t.reviewStatus === "approved" && (
                        <span className="text-xs bg-forest-mid/20 text-forest-mid px-1.5 py-0.5 rounded-full flex-shrink-0">通过</span>
                      )}
                      {t.reviewStatus === "rejected" && (
                        <span className="text-xs bg-berry-red/20 text-berry-red px-1.5 py-0.5 rounded-full flex-shrink-0">驳回</span>
                      )}
                    </div>
                    <div className="text-xs text-forest-bark mt-0.5">{t.date} · {t.category}</div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ml-2 ${t.type === "income" ? "text-forest-mid" : "text-berry-red"}`}>
                    {formatAmount(t)}
                  </span>
                </div>

                {/* 家长评语 */}
                {t.parentComment && (
                  <div className="mt-2 text-xs text-forest-bark bg-white/30 rounded-xl px-2 py-1">
                    💬 {t.parentComment}
                  </div>
                )}

                {/* 添加评语按钮 */}
                {commentingId !== t.id ? (
                  <button
                    onClick={() => { setCommentingId(t.id); setCommentText(t.parentComment || ""); }}
                    className="mt-2 text-xs text-forest-bark hover:text-forest-deep transition-colors flex items-center gap-1"
                  >
                    <MessageSquare size={12} />
                    {t.parentComment ? "修改评语" : "添加评语"}
                  </button>
                ) : (
                  <div className="mt-2 flex gap-2 animate-slide-up">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="输入家长评语…"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-xs text-forest-deep"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSubmitComment(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-forest-mid/20 text-forest-mid text-xs font-medium hover:bg-forest-mid/30 transition-all"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => { setCommentingId(null); setCommentText(""); }}
                      className="px-3 py-1.5 rounded-xl bg-white/30 text-forest-bark text-xs hover:bg-white/50 transition-all"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 消费预警记录 */}
      {settings.alertThreshold > 0 && (
        <section className="glass-card p-5 md:p-6">
          <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-berry-red" />
            消费预警
            <span className="text-xs text-forest-bark ml-2">（≥¥{settings.alertThreshold}）</span>
            {alertTransactions.length > 0 && (
              <span className="ml-auto text-xs bg-berry-red/20 text-berry-red px-2 py-0.5 rounded-full">
                {alertTransactions.length} 条
              </span>
            )}
          </h2>
          {alertTransactions.length === 0 ? (
            <p className="text-sm text-forest-bark text-center py-4">暂无消费预警</p>
          ) : (
            <div className="space-y-2">
              {alertTransactions.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-berry-red/10 border border-berry-red/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-forest-deep">{t.title}</span>
                    <span className="text-sm font-bold text-berry-red">-¥{t.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-forest-bark mt-1">{t.date} · {t.category}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 animate-slide-up max-w-sm text-center">
          <span className="font-medium text-forest-deep">{toast}</span>
        </div>
      )}
    </div>
  );
}
