import {
  getSubjectAverages,
  getSubjectColor,
  sortByDateAsc,
} from "@/utils/scoreStats";
import { type ExamRecord } from "@/types";

interface RadarChartProps {
  records: ExamRecord[];
}

// 科目雷达图(SVG)
export default function RadarChart({ records }: RadarChartProps) {
  const averages = getSubjectAverages(records);

  if (averages.length < 3) {
    return (
      <div className="glass-card p-8 text-center text-forest-bark text-sm">
        <div className="text-3xl mb-2">📊</div>
        至少需要 3 个科目才能生成雷达图
        <div className="text-xs mt-1">继续录入成绩吧!</div>
      </div>
    );
  }

  const size = 280;
  const center = size / 2;
  const radius = 100;
  const n = averages.length;

  // 多边形顶点角度
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pointToXY = (i: number, r: number) => ({
    x: center + Math.cos(angle(i)) * r,
    y: center + Math.sin(angle(i)) * r,
  });

  // 网格层
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // 数据多边形点
  const dataPoints = averages.map((a, i) => {
    const r = (a.avgRate / 100) * radius;
    return pointToXY(i, r);
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display text-lg text-forest-deep mb-3">🎯 科目强弱雷达</h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          {/* 网格多边形 */}
          {levels.map((lv) => {
            const pts = averages
              .map((_, i) => {
                const p = pointToXY(i, radius * lv);
                return `${p.x},${p.y}`;
              })
              .join(" ");
            return (
              <polygon
                key={lv}
                points={pts}
                fill="none"
                stroke="rgba(45,95,63,0.15)"
                strokeWidth={1}
              />
            );
          })}
          {/* 轴线 */}
          {averages.map((_, i) => {
            const p = pointToXY(i, radius);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                stroke="rgba(45,95,63,0.15)"
                strokeWidth={1}
              />
            );
          })}
          {/* 数据多边形 */}
          <polygon
            points={dataPath}
            fill="rgba(127,176,105,0.35)"
            stroke="#3D7B52"
            strokeWidth={2}
          />
          {/* 数据点 */}
          {dataPoints.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={getSubjectColor(averages[i].subject)} strokeWidth={2} />
            </g>
          ))}
          {/* 科目标签 */}
          {averages.map((a, i) => {
            const p = pointToXY(i, radius + 22);
            return (
              <g key={a.subject}>
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill="#2D5F3F"
                >
                  {a.subject}
                </text>
                <text
                  x={p.x}
                  y={p.y + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8B6F47"
                >
                  {a.avgRate}%
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex-1 space-y-2 w-full">
          {averages
            .sort((a, b) => b.avgRate - a.avgRate)
            .map((a) => (
              <div
                key={a.subject}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/30"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: getSubjectColor(a.subject) }}
                />
                <span className="text-sm text-forest-deep flex-1">{a.subject}</span>
                <span className="text-xs text-forest-bark">{a.count}次</span>
                <span className="font-bold text-sm" style={{ color: getSubjectColor(a.subject) }}>
                  {a.avgRate}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
