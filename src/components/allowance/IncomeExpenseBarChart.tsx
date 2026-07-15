interface IncomeExpenseBarChartProps {
  incomeTotal: number;
  expenseTotal: number;
}

export default function IncomeExpenseBarChart({
  incomeTotal,
  expenseTotal,
}: IncomeExpenseBarChartProps) {
  const maxVal = Math.max(incomeTotal, expenseTotal, 1);
  const incomeHeight = (incomeTotal / maxVal) * 100;
  const expenseHeight = (expenseTotal / maxVal) * 100;

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display text-lg text-forest-deep mb-3">
        💰 收支对比
      </h3>
      {incomeTotal === 0 && expenseTotal === 0 ? (
        <div className="text-center text-forest-bark text-sm py-8">
          暂无收支数据
        </div>
      ) : (
        <div className="flex items-end justify-center gap-12 h-48">
          {/* 收入柱 */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "#52B788" }}>
              ¥{incomeTotal.toFixed(1)}
            </span>
            <div className="w-16 relative" style={{ height: "160px" }}>
              <div
                className="absolute bottom-0 w-full rounded-t-xl transition-all duration-700"
                style={{
                  height: `${incomeHeight}%`,
                  background: "linear-gradient(180deg, #52B788, #40916C)",
                }}
              />
            </div>
            <span className="text-xs text-forest-bark">收入</span>
          </div>
          {/* 支出柱 */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "#F77F00" }}>
              ¥{expenseTotal.toFixed(1)}
            </span>
            <div className="w-16 relative" style={{ height: "160px" }}>
              <div
                className="absolute bottom-0 w-full rounded-t-xl transition-all duration-700"
                style={{
                  height: `${expenseHeight}%`,
                  background: "linear-gradient(180deg, #F77F00, #E36414)",
                }}
              />
            </div>
            <span className="text-xs text-forest-bark">支出</span>
          </div>
        </div>
      )}
    </div>
  );
}
