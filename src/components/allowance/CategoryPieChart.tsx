interface CategoryPieChartProps {
  categories: Array<{ name: string; amount: number; color: string }>;
  onClick?: (category: string) => void;
}

export default function CategoryPieChart({
  categories,
  onClick,
}: CategoryPieChartProps) {
  const total = categories.reduce((sum, c) => sum + c.amount, 0);
  const size = 220;
  const center = size / 2;
  const outerR = 90;
  const innerR = 55;

  if (total === 0 || categories.length === 0) {
    return (
      <div className="glass-card p-4 md:p-6">
        <h3 className="font-display text-lg text-forest-deep mb-3">
          📊 支出分类
        </h3>
        <div className="text-center text-forest-bark text-sm py-8">
          暂无支出数据
        </div>
      </div>
    );
  }

  // 计算各扇区弧度
  let cumulativeAngle = -90; // 从12点方向开始
  const arcs = categories
    .filter((c) => c.amount > 0)
    .map((c) => {
      const angle = (c.amount / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1Outer = center + outerR * Math.cos(startRad);
      const y1Outer = center + outerR * Math.sin(startRad);
      const x2Outer = center + outerR * Math.cos(endRad);
      const y2Outer = center + outerR * Math.sin(endRad);
      const x1Inner = center + innerR * Math.cos(endRad);
      const y1Inner = center + innerR * Math.sin(endRad);
      const x2Inner = center + innerR * Math.cos(startRad);
      const y2Inner = center + innerR * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = [
        `M ${x1Outer} ${y1Outer}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
        `L ${x1Inner} ${y1Inner}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
        "Z",
      ].join(" ");

      const midRad = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      const labelR = outerR + 18;
      const labelX = center + labelR * Math.cos(midRad);
      const labelY = center + labelR * Math.sin(midRad);

      return {
        ...c,
        path,
        percent: ((c.amount / total) * 100).toFixed(1),
        labelX,
        labelY,
        name: c.name,
      };
    });

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display text-lg text-forest-deep mb-3">
        📊 支出分类
      </h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          {arcs.map((arc) => (
            <path
              key={arc.name}
              d={arc.path}
              fill={arc.color}
              className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
              onClick={() => onClick?.(arc.name)}
            />
          ))}
          {/* 中间总金额 */}
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#2D5F3F"
          >
            ¥{total.toFixed(0)}
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            fontSize="10"
            fill="#8B6F47"
          >
            总支出
          </text>
        </svg>
        {/* 图例 */}
        <div className="flex-1 space-y-2 w-full">
          {arcs.map((arc) => (
            <div
              key={arc.name}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/30 cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => onClick?.(arc.name)}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: arc.color }}
              />
              <span className="text-sm text-forest-deep flex-1">
                {arc.name}
              </span>
              <span className="text-xs text-forest-bark">{arc.percent}%</span>
              <span
                className="text-sm font-bold"
                style={{ color: arc.color }}
              >
                ¥{arc.amount.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
