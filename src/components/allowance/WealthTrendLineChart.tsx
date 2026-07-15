interface WealthTrendLineChartProps {
  data: Array<{ date: string; balance: number }>;
}

export default function WealthTrendLineChart({
  data,
}: WealthTrendLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-4 md:p-6">
        <h3 className="font-display text-lg text-forest-deep mb-3">
          📈 财富趋势
        </h3>
        <div className="text-center text-forest-bark text-sm py-8">
          暂无数据
        </div>
      </div>
    );
  }

  // 图表尺寸
  const W = 720;
  const H = 320;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  // Y轴自动缩放
  const balances = data.map((d) => d.balance);
  const yMin = Math.min(...balances, 0);
  const yMax = Math.max(...balances, 1);
  const yRange = yMax - yMin || 1;
  const yPadding = yRange * 0.1;
  const yLo = Math.floor((yMin - yPadding) / 10) * 10;
  const yHi = Math.ceil((yMax + yPadding) / 10) * 10;
  const yScale = yHi - yLo || 1;

  const yToPx = (v: number) =>
    padding.top + innerH - ((v - yLo) / yScale) * innerH;

  const xToPx = (i: number) =>
    data.length === 1
      ? padding.left + innerW / 2
      : padding.left + (i / (data.length - 1)) * innerW;

  // 折线点
  const points = data.map((d, i) => ({
    x: xToPx(i),
    y: yToPx(d.balance),
    ...d,
  }));

  // polyline points字符串
  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  // 渐变填充区域
  const areaStr = [
    `${points[0].x},${padding.top + innerH}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padding.top + innerH}`,
  ].join(" ");

  // Y轴刻度（5个刻度）
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const val = yLo + (yScale / yTickCount) * i;
    return Math.round(val);
  });

  // 日期格式化
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display text-lg text-forest-deep mb-3">
        📈 财富趋势
      </h3>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[600px]"
          style={{ height: "auto" }}
        >
          <defs>
            <linearGradient id="wealthAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4CC9F0" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y轴网格线 */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={padding.left}
                y1={yToPx(t)}
                x2={W - padding.right}
                y2={yToPx(t)}
                stroke="rgba(45,95,63,0.12)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={yToPx(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#8B6F47"
              >
                ¥{t}
              </text>
            </g>
          ))}

          {/* X轴标签 */}
          {data.map((d, i) => (
            <text
              key={d.date}
              x={xToPx(i)}
              y={H - padding.bottom + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#8B6F47"
            >
              {formatDate(d.date)}
            </text>
          ))}

          {/* 渐变填充区域 */}
          <polygon points={areaStr} fill="url(#wealthAreaGrad)" />

          {/* 折线 */}
          {points.length > 1 && (
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#4CC9F0"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 数据点 */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill="white"
                stroke="#4CC9F0"
                strokeWidth={2.5}
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#4CC9F0"
              >
                ¥{p.balance.toFixed(0)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
