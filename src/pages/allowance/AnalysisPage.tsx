import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import ForestBackground from "@/components/ForestBackground";
import IncomeExpenseBarChart from "@/components/allowance/IncomeExpenseBarChart";
import CategoryPieChart from "@/components/allowance/CategoryPieChart";
import WealthTrendLineChart from "@/components/allowance/WealthTrendLineChart";

const CATEGORY_COLORS: Record<string, string> = {
  学习用品: "#4361EE",
  零食饮料: "#F77F00",
  玩具娱乐: "#E76F51",
  餐饮交通: "#457B9D",
  礼物捐赠: "#FF70A6",
  其他: "#8D99AE",
};

export default function AllowanceAnalysisPage() {
  const navigate = useNavigate();
  const allowanceTransactions = useAppStore((s) => s.allowanceTransactions);
  const wallet = useAppStore((s) => s.wallet);

  // 当前月交易
  const now = new Date();
  const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

  const monthTransactions = useMemo(() => {
    return allowanceTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() * 100 + (d.getMonth() + 1) === currentMonth;
    });
  }, [allowanceTransactions, currentMonth]);

  // 收支汇总
  const incomeTotal = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = incomeTotal - expenseTotal;

  // 支出分类
  const categoryData = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.type === "expense");
    const map = new Map<string, number>();
    expenses.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        color: CATEGORY_COLORS[name] || "#8D99AE",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  // 财富趋势（最近3个月，按周聚合）
  const wealthTrend = useMemo(() => {
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recent = allowanceTransactions
      .filter((t) => new Date(t.date) >= threeMonthsAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recent.length === 0) return [];

    // 按周聚合：计算每周的余额变化
    const weeklyBalance = new Map<string, number>();
    let runningBalance = 0;

    // 先计算起始余额
    const beforeRecent = allowanceTransactions.filter(
      (t) => new Date(t.date) < threeMonthsAgo
    );
    beforeRecent.forEach((t) => {
      runningBalance +=
        t.type === "income" ? t.amount : -t.amount;
    });

    // 按周分组
    const getWeekKey = (dateStr: string) => {
      const d = new Date(dateStr);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().slice(0, 10);
    };

    // 按时间顺序处理
    const allRecent = [...recent].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    allRecent.forEach((t) => {
      runningBalance +=
        t.type === "income" ? t.amount : -t.amount;
      const weekKey = getWeekKey(t.date);
      weeklyBalance.set(weekKey, runningBalance);
    });

    return Array.from(weeklyBalance.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, balance]) => ({ date, balance }));
  }, [allowanceTransactions]);

  // 核心指标
  const savingsRate =
    incomeTotal > 0 ? ((wallet.saveBalance / incomeTotal) * 100) : 0;

  // 消费反思统计
  const moodStats = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.type === "expense");
    const happy = expenses.filter((t) => t.mood === "happy").length;
    const normal = expenses.filter((t) => t.mood === "normal").length;
    const regret = expenses.filter((t) => t.mood === "regret").length;
    return { happy, normal, regret, total: expenses.length };
  }, [monthTransactions]);

  // 个性化建议
  const suggestions = useMemo(() => {
    const tips: string[] = [];
    if (balance < 0) {
      tips.push("本月支出超过收入，试试减少零食饮料的开支吧！");
    }
    if (moodStats.regret > moodStats.total * 0.3) {
      tips.push("有较多冲动消费，下次花钱前先想一想是否真的需要。");
    }
    if (savingsRate < 20 && incomeTotal > 0) {
      tips.push("储蓄率偏低，建议至少存下收入的20%哦。");
    }
    if (savingsRate >= 50) {
      tips.push("储蓄率很棒！继续保持这个好习惯！");
    }
    if (categoryData.length > 0 && categoryData[0].amount > expenseTotal * 0.6) {
      tips.push(`${categoryData[0].name}占比过高，注意合理分配预算。`);
    }
    if (tips.length === 0) {
      tips.push("财务状况良好，继续保持理性消费的好习惯！");
    }
    return tips;
  }, [balance, moodStats, savingsRate, categoryData, expenseTotal]);

  // 月度徽章
  const badge = useMemo(() => {
    if (savingsRate >= 60) return { emoji: "🏆", label: "储蓄达人" };
    if (savingsRate >= 40) return { emoji: "🥇", label: "理财小能手" };
    if (savingsRate >= 20) return { emoji: "🥈", label: "省钱新星" };
    if (balance >= 0) return { emoji: "🥉", label: "收支平衡" };
    return { emoji: "💪", label: "努力进步中" };
  }, [savingsRate, balance]);

  return (
    <div className="space-y-6">
      <ForestBackground />
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
          📊 财商分析
        </h1>
        <p className="text-forest-bark mt-1 text-sm">
          了解你的收支状况，培养理财好习惯
        </p>
      </header>

      {/* 1. 收支对比区 */}
      <IncomeExpenseBarChart
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
      />
      <div
        className="glass-card p-4 text-center text-sm"
        style={{
          color: balance >= 0 ? "#52B788" : "#F77F00",
        }}
      >
        {balance >= 0 ? (
          <span>
            🎉 本月结余 <strong>¥{balance.toFixed(1)}</strong>，表现出色，继续保持！
          </span>
        ) : (
          <span>
            ⚠️ 本月超支 <strong>¥{Math.abs(balance).toFixed(1)}</strong>，注意控制开支哦！
          </span>
        )}
      </div>

      {/* 2. 支出分类区 */}
      <CategoryPieChart
        categories={categoryData}
        onClick={(category) => {
          navigate(`/allowance/detail?category=${encodeURIComponent(category)}`);
        }}
      />

      {/* 3. 财富趋势区 */}
      <WealthTrendLineChart data={wealthTrend} />

      {/* 4. 月度财商报告区 */}
      <div className="glass-card p-4 md:p-6">
        <h3 className="font-display text-lg text-forest-deep mb-4">
          📋 月度财商报告
        </h3>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <MetricCard label="赚取" value={`¥${incomeTotal.toFixed(1)}`} color="#52B788" icon="💰" />
          <MetricCard label="支出" value={`¥${expenseTotal.toFixed(1)}`} color="#F77F00" icon="🛒" />
          <MetricCard label="结余" value={`¥${balance.toFixed(1)}`} color={balance >= 0 ? "#52B788" : "#F77F00"} icon="📊" />
          <MetricCard label="储蓄率" value={`${savingsRate.toFixed(0)}%`} color="#4CC9F0" icon="🏦" />
        </div>

        {/* 消费反思统计 */}
        {moodStats.total > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-forest-deep mb-2">
              🤔 消费反思
            </h4>
            <div className="flex gap-3">
              <MoodPill emoji="😊" label="开心" count={moodStats.happy} total={moodStats.total} color="#52B788" />
              <MoodPill emoji="😐" label="一般" count={moodStats.normal} total={moodStats.total} color="#8D99AE" />
              <MoodPill emoji="😅" label="后悔" count={moodStats.regret} total={moodStats.total} color="#F77F00" />
            </div>
          </div>
        )}

        {/* 个性化建议 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-forest-deep mb-2">
            💡 个性化建议
          </h4>
          <div className="space-y-2">
            {suggestions.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 rounded-xl bg-white/30"
              >
                <span className="text-sm mt-0.5">✨</span>
                <span className="text-sm text-forest-bark">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 月度徽章 */}
        <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-white/30 to-white/10">
          <div className="text-4xl mb-1">{badge.emoji}</div>
          <div className="font-display text-lg text-forest-deep">
            {badge.label}
          </div>
          <div className="text-xs text-forest-bark mt-1">本月财商徽章</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <div className="glass-card p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-display text-lg" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-forest-bark mt-0.5">{label}</div>
    </div>
  );
}

function MoodPill({
  emoji,
  label,
  count,
  total,
  color,
}: {
  emoji: string;
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
  return (
    <div className="flex-1 glass-card p-2 text-center">
      <div className="text-lg">{emoji}</div>
      <div className="text-xs text-forest-bark">{label}</div>
      <div className="font-display text-sm" style={{ color }}>
        {pct}%
      </div>
    </div>
  );
}
