import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowLeft, AlertCircle, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import ForestBackground from "@/components/ForestBackground";
import { todayISO } from "@/utils/date";
import type { SpendMood, IncomeSource, AccountType, ExpenseCategory } from "@/types";

const EXPENSE_CATEGORIES: { value: ExpenseCategory; icon: string }[] = [
  { value: "学习用品", icon: "✏️" },
  { value: "零食饮料", icon: "🍬" },
  { value: "玩具娱乐", icon: "🎮" },
  { value: "餐饮交通", icon: "🚌" },
  { value: "礼物捐赠", icon: "🎁" },
  { value: "其他", icon: "📦" },
];

const MOOD_OPTIONS: { value: SpendMood; label: string; icon: string; color: string }[] = [
  { value: "happy", label: "开心", icon: "😊", color: "#52B788" },
  { value: "normal", label: "一般", icon: "😐", color: "#4CC9F0" },
  { value: "regret", label: "后悔", icon: "😔", color: "#F77F00" },
];

const INCOME_SOURCES: { value: IncomeSource; label: string; icon: string }[] = [
  { value: "exchange", label: "星愿兑换", icon: "⭐" },
  { value: "parent", label: "家长发放", icon: "👨‍👩‍👧" },
  { value: "other", label: "其他", icon: "💰" },
];

const QUICK_TEMPLATES = [
  { name: "买文具", category: "学习用品" as ExpenseCategory, amount: 5 },
  { name: "买零食", category: "零食饮料" as ExpenseCategory, amount: 3 },
  { name: "买玩具", category: "玩具娱乐" as ExpenseCategory, amount: 10 },
  { name: "交通费", category: "餐饮交通" as ExpenseCategory, amount: 2 },
];

type RecordMode = "expense" | "income";

export default function AddRecordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") === "income" ? "income" : "expense") as RecordMode;

  const wallet = useAppStore((s) => s.wallet);
  const wishItems = useAppStore((s) => s.wishItems);
  const recordExpense = useAppStore((s) => s.recordExpense);
  const recordIncome = useAppStore((s) => s.recordIncome);

  const [mode, setMode] = useState<RecordMode>(initialMode);

  // 支出表单
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<ExpenseCategory>("学习用品");
  const [remark, setRemark] = useState("");
  const [mood, setMood] = useState<SpendMood | null>(null);
  const [account, setAccount] = useState<AccountType>("consume");

  // 收入表单
  const [incomeSource, setIncomeSource] = useState<IncomeSource>("exchange");
  const [incomeTitle, setIncomeTitle] = useState("");
  const [incomeAmount, setIncomeAmount] = useState<number>(0);

  const [toast, setToast] = useState<string | null>(null);
  const [showOpportunityTip, setShowOpportunityTip] = useState(false);

  const activeWishes = wishItems.filter((w) => w.status === "active");
  const consumeBalance = wallet.consumeBalance;

  const handleQuickTemplate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    setMode("expense");
    setTitle(tpl.name);
    setAmount(tpl.amount);
    setCategory(tpl.category);
  };

  const handleSubmitExpense = () => {
    if (!title.trim()) {
      setToast("请输入项目名称");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (amount <= 0) {
      setToast("请输入金额");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const accountBalance =
      account === "consume"
        ? wallet.consumeBalance
        : account === "save"
        ? wallet.saveBalance
        : wallet.shareBalance;
    if (amount > accountBalance) {
      setToast(`${account === "consume" ? "消费金" : account === "save" ? "储蓄金" : "分享金"}余额不足`);
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // 机会成本提示
    if (activeWishes.length > 0 && !showOpportunityTip) {
      setShowOpportunityTip(true);
      return;
    }

    recordExpense(title.trim(), amount, category, account, mood || undefined, remark || undefined);
    navigate("/allowance");
  };

  const handleSubmitIncome = () => {
    if (!incomeTitle.trim()) {
      setToast("请输入项目名称");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    if (incomeAmount <= 0) {
      setToast("请输入金额");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    recordIncome(incomeAmount, incomeSource, incomeTitle.trim());
    navigate("/allowance");
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
            <h1 className="font-display text-3xl text-forest-deep text-shadow-forest">
              📝 记一笔
            </h1>
          </div>
        </header>

        {/* 模式切换 */}
        <div className="glass-card p-1 flex">
          <button
            onClick={() => setMode("expense")}
            className={clsx(
              "flex-1 py-2.5 rounded-2xl font-medium text-sm transition-all",
              mode === "expense"
                ? "bg-[#F77F00]/15 text-[#F77F00] border-2 border-[#F77F00]/40"
                : "text-forest-bark hover:text-forest-deep"
            )}
          >
            💸 支出
          </button>
          <button
            onClick={() => setMode("income")}
            className={clsx(
              "flex-1 py-2.5 rounded-2xl font-medium text-sm transition-all",
              mode === "income"
                ? "bg-[#52B788]/15 text-[#52B788] border-2 border-[#52B788]/40"
                : "text-forest-bark hover:text-forest-deep"
            )}
          >
            💰 收入
          </button>
        </div>

        {mode === "expense" ? (
          /* ====== 支出表单 ====== */
          <div className="space-y-4">
            {/* 常用支出模板 */}
            <div className="glass-card p-4">
              <div className="text-sm font-medium text-forest-deep mb-2">常用支出</div>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleQuickTemplate(tpl)}
                    className="py-2 px-1 rounded-xl bg-white/40 hover:bg-white/60 text-xs text-forest-deep transition-colors flex flex-col items-center gap-1"
                  >
                    <span className="text-lg">{EXPENSE_CATEGORIES.find((c) => c.value === tpl.category)?.icon}</span>
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 支出表单主体 */}
            <div className="glass-card p-6 space-y-4">
              {/* 名称 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">
                  项目名称 <span className="text-[#F77F00]">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：买铅笔"
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 text-forest-deep"
                />
              </div>

              {/* 金额 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">
                  金额 <span className="text-[#F77F00]">*</span>
                </label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={amount || ""}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="0.00"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 text-forest-deep font-display text-xl"
                  />
                  <span className="text-sm text-forest-bark">元</span>
                </div>
                {amount > consumeBalance && account === "consume" && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-[#F77F00]">
                    <AlertCircle size={12} /> 超出消费金余额
                  </div>
                )}
              </div>

              {/* 日期 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none text-forest-deep"
                />
              </div>

              {/* 分类选择 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">分类</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={clsx(
                        "py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                        category === cat.value
                          ? "bg-[#F77F00]/15 text-[#F77F00] border-2 border-[#F77F00]/40"
                          : "bg-white/30 text-forest-bark hover:bg-white/50 border-2 border-transparent"
                      )}
                    >
                      <span>{cat.icon}</span>
                      {cat.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* 账户选择 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">从哪个账户支出</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {([
                    { type: "consume" as AccountType, label: "消费金", color: "#4361EE", icon: "🛒" },
                    { type: "save" as AccountType, label: "储蓄金", color: "#FFB703", icon: "🏦" },
                    { type: "share" as AccountType, label: "分享金", color: "#FF70A6", icon: "💝" },
                  ]).map((acc) => (
                    <button
                      key={acc.type}
                      onClick={() => setAccount(acc.type)}
                      className={clsx(
                        "py-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5",
                        account === acc.type
                          ? "border-2"
                          : "bg-white/30 text-forest-bark hover:bg-white/50 border-2 border-transparent"
                      )}
                      style={account === acc.type ? { borderColor: acc.color + "66", backgroundColor: acc.color + "18", color: acc.color } : {}}
                    >
                      <span className="text-lg">{acc.icon}</span>
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">备注</label>
                <input
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="可选"
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none text-forest-deep"
                />
              </div>

              {/* 消费心情 */}
              <div>
                <label className="text-sm font-medium text-forest-deep">消费心情</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMood(mood === opt.value ? null : opt.value)}
                      className={clsx(
                        "py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                        mood === opt.value
                          ? "border-2"
                          : "bg-white/30 text-forest-bark hover:bg-white/50 border-2 border-transparent"
                      )}
                      style={mood === opt.value ? { borderColor: opt.color + "66", backgroundColor: opt.color + "18", color: opt.color } : {}}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 提交 */}
              <button
                onClick={handleSubmitExpense}
                className="w-full py-3 rounded-2xl bg-[#F77F00] text-white font-medium hover:bg-[#F77F00]/90 active:scale-[0.98] transition-all"
              >
                记录支出
              </button>
            </div>

            {/* 机会成本提示弹窗 */}
            {showOpportunityTip && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
                  onClick={() => setShowOpportunityTip(false)}
                />
                <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up text-center">
                  <div className="text-4xl mb-3">🌟</div>
                  <h3 className="font-display text-lg text-forest-deep mb-2">机会成本提醒</h3>
                  <p className="text-sm text-forest-bark mb-1">
                    你正在为心愿「{activeWishes[0]?.title}」攒钱
                  </p>
                  <p className="text-sm text-forest-bark mb-4">
                    这笔 {amount.toFixed(2)} 元如果存起来，离心愿就更近一步了。确定要花吗？
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowOpportunityTip(false)}
                      className="py-2.5 rounded-2xl bg-white/40 text-forest-bark font-medium text-sm hover:bg-white/60 transition-colors"
                    >
                      再想想
                    </button>
                    <button
                      onClick={() => {
                        setShowOpportunityTip(false);
                        recordExpense(title.trim(), amount, category, account, mood || undefined, remark || undefined);
                        navigate("/allowance");
                      }}
                      className="py-2.5 rounded-2xl bg-[#F77F00] text-white font-medium text-sm hover:bg-[#F77F00]/90 transition-colors"
                    >
                      还是花吧
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ====== 收入表单 ====== */
          <div className="glass-card p-6 space-y-4">
            {/* 来源选择 */}
            <div>
              <label className="text-sm font-medium text-forest-deep">收入来源</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {INCOME_SOURCES.map((src) => (
                  <button
                    key={src.value}
                    onClick={() => setIncomeSource(src.value)}
                    className={clsx(
                      "py-2.5 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1",
                      incomeSource === src.value
                        ? "bg-[#52B788]/15 text-[#52B788] border-2 border-[#52B788]/40"
                        : "bg-white/30 text-forest-bark hover:bg-white/50 border-2 border-transparent"
                    )}
                  >
                    <span className="text-lg">{src.icon}</span>
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 金额 */}
            <div>
              <label className="text-sm font-medium text-forest-deep">
                金额 <span className="text-[#52B788]">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={incomeAmount || ""}
                  onChange={(e) => setIncomeAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0.00"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 text-forest-deep font-display text-xl"
                />
                <span className="text-sm text-forest-bark">元</span>
              </div>
            </div>

            {/* 名称 */}
            <div>
              <label className="text-sm font-medium text-forest-deep">
                项目名称 <span className="text-[#52B788]">*</span>
              </label>
              <input
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                placeholder="如：家长发放零用钱"
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#52B788]/30 text-forest-deep"
              />
            </div>

            {/* 提交 */}
            <button
              onClick={handleSubmitIncome}
              className="w-full py-3 rounded-2xl bg-[#52B788] text-white font-medium hover:bg-[#52B788]/90 active:scale-[0.98] transition-all"
            >
              记录收入
            </button>
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
