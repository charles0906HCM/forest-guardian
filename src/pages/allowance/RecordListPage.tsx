import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowLeft, Filter, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import ForestBackground from "@/components/ForestBackground";
import { todayISO, fromISODate, toISODate, addDays, getWeekRange, getMonthRange } from "@/utils/date";
import type { AllowanceTransaction, ExpenseCategory } from "@/types";

const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  学习用品: "✏️",
  零食饮料: "🍬",
  玩具娱乐: "🎮",
  餐饮交通: "🚌",
  礼物捐赠: "🎁",
  其他: "📦",
  星愿兑换: "⭐",
  家长发放: "👨‍👩‍👧",
  其他收入: "💰",
};

type TimeFilter = "thisWeek" | "thisMonth" | "lastMonth";
type TypeFilter = "all" | "income" | "expense";

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "thisWeek", label: "本周" },
  { value: "thisMonth", label: "本月" },
  { value: "lastMonth", label: "上月" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "income", label: "收入" },
  { value: "expense", label: "支出" },
];

const ALL_CATEGORIES: string[] = [
  "学习用品",
  "零食饮料",
  "玩具娱乐",
  "餐饮交通",
  "礼物捐赠",
  "其他",
  "星愿兑换",
  "家长发放",
  "其他收入",
];

export default function RecordListPage() {
  const navigate = useNavigate();
  const allowanceTransactions = useAppStore((s) => s.allowanceTransactions);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("thisMonth");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedTx, setSelectedTx] = useState<AllowanceTransaction | null>(null);

  // 时间范围计算
  const today = todayISO();
  const dateRange = useMemo(() => {
    if (timeFilter === "thisWeek") {
      const range = getWeekRange(today);
      return { start: range.start, end: range.end };
    } else if (timeFilter === "thisMonth") {
      const range = getMonthRange(today);
      return { start: range.start, end: range.end };
    } else {
      // 上月
      const d = fromISODate(today);
      const lastMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const lastMonthStart = toISODate(lastMonth);
      const lastMonthEnd = toISODate(new Date(d.getFullYear(), d.getMonth(), 0));
      return { start: lastMonthStart, end: lastMonthEnd };
    }
  }, [timeFilter, today]);

  // 筛选后的记录
  const filteredTransactions = useMemo(() => {
    return allowanceTransactions
      .filter((t) => {
        // 时间范围
        if (t.date < dateRange.start || t.date > dateRange.end) return false;
        // 收支类型
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        // 分类
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [allowanceTransactions, dateRange, typeFilter, categoryFilter]);

  // 统计
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

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
          <div className="flex-1">
            <h1 className="font-display text-3xl text-forest-deep text-shadow-forest">
              📊 收支明细
            </h1>
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={clsx(
              "w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-colors",
              showFilterPanel ? "bg-[#4CC9F0]/15 text-[#4CC9F0]" : "hover:bg-white/50"
            )}
          >
            <Filter size={18} />
          </button>
        </header>

        {/* 筛选面板 */}
        {showFilterPanel && (
          <div className="glass-card p-4 space-y-3 animate-slide-up">
            {/* 时间筛选 */}
            <div>
              <div className="text-xs font-medium text-forest-bark mb-1.5">时间</div>
              <div className="flex gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeFilter(opt.value)}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                      timeFilter === opt.value
                        ? "bg-[#4CC9F0]/15 text-[#4CC9F0]"
                        : "bg-white/30 text-forest-bark hover:bg-white/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 收支类型筛选 */}
            <div>
              <div className="text-xs font-medium text-forest-bark mb-1.5">类型</div>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                      typeFilter === opt.value
                        ? "bg-[#4CC9F0]/15 text-[#4CC9F0]"
                        : "bg-white/30 text-forest-bark hover:bg-white/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 分类筛选 */}
            <div>
              <div className="text-xs font-medium text-forest-bark mb-1.5">分类</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={clsx(
                    "px-2.5 py-1 rounded-xl text-xs font-medium transition-all",
                    categoryFilter === "all"
                      ? "bg-[#4CC9F0]/15 text-[#4CC9F0]"
                      : "bg-white/30 text-forest-bark hover:bg-white/50"
                  )}
                >
                  全部
                </button>
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={clsx(
                      "px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1",
                      categoryFilter === cat
                        ? "bg-[#4CC9F0]/15 text-[#4CC9F0]"
                        : "bg-white/30 text-forest-bark hover:bg-white/50"
                    )}
                  >
                    <span>{EXPENSE_CATEGORY_ICONS[cat] || "📦"}</span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 统计概览 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3 text-center">
            <div className="text-xs text-forest-bark">收入</div>
            <div className="font-display text-xl text-[#52B788] mt-0.5">
              +{totalIncome.toFixed(2)}
            </div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-xs text-forest-bark">支出</div>
            <div className="font-display text-xl text-[#F77F00] mt-0.5">
              -{totalExpense.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 交易记录列表 */}
        <section>
          {filteredTransactions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm text-forest-bark">没有符合条件的记录</p>
            </div>
          ) : (
            <div className="glass-card p-4 space-y-1">
              {filteredTransactions.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {tx.type === "income"
                        ? "💰"
                        : EXPENSE_CATEGORY_ICONS[tx.category] || "📦"}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm text-forest-deep truncate font-medium">
                        {tx.title}
                      </div>
                      <div className="text-[10px] text-forest-bark flex items-center gap-1.5">
                        <span>{tx.category}</span>
                        <span>·</span>
                        <span>
                          {new Date(tx.date).toLocaleDateString("zh-CN", {
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={clsx(
                      "font-bold text-sm flex-shrink-0",
                      tx.type === "income" ? "text-[#52B788]" : "text-[#F77F00]"
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {tx.amount.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 详情弹窗 */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
              onClick={() => setSelectedTx(null)}
            />
            <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up">
              <button
                onClick={() => setSelectedTx(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center"
              >
                <X size={18} className="text-forest-bark" />
              </button>

              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {selectedTx.type === "income"
                    ? "💰"
                    : EXPENSE_CATEGORY_ICONS[selectedTx.category] || "📦"}
                </div>
                <h3 className="font-display text-xl text-forest-deep">{selectedTx.title}</h3>
                <div
                  className={clsx(
                    "font-display text-3xl mt-2",
                    selectedTx.type === "income" ? "text-[#52B788]" : "text-[#F77F00]"
                  )}
                >
                  {selectedTx.type === "income" ? "+" : "-"}
                  {selectedTx.amount.toFixed(2)}
                  <span className="text-sm ml-1 text-forest-bark">元</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <DetailRow label="类型" value={selectedTx.type === "income" ? "收入" : "支出"} />
                <DetailRow label="分类" value={selectedTx.category} />
                <DetailRow
                  label="日期"
                  value={new Date(selectedTx.date).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                />
                {selectedTx.remark && <DetailRow label="备注" value={selectedTx.remark} />}
                {selectedTx.mood && (
                  <DetailRow
                    label="心情"
                    value={
                      selectedTx.mood === "happy"
                        ? "😊 开心"
                        : selectedTx.mood === "normal"
                        ? "😐 一般"
                        : "😔 后悔"
                    }
                  />
                )}
                {selectedTx.source && (
                  <DetailRow
                    label="来源"
                    value={
                      selectedTx.source === "exchange"
                        ? "星愿兑换"
                        : selectedTx.source === "parent"
                        ? "家长发放"
                        : "其他"
                    }
                  />
                )}
                {selectedTx.parentComment && (
                  <DetailRow label="家长评语" value={selectedTx.parentComment} />
                )}
                {selectedTx.reviewStatus && (
                  <DetailRow
                    label="审核状态"
                    value={
                      selectedTx.reviewStatus === "pending"
                        ? "⏳ 待审核"
                        : selectedTx.reviewStatus === "approved"
                        ? "✅ 已通过"
                        : "❌ 已驳回"
                    }
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/20 last:border-0">
      <span className="text-forest-bark">{label}</span>
      <span className="text-forest-deep font-medium">{value}</span>
    </div>
  );
}
