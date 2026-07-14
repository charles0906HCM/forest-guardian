import {
  getSubjectTrend,
  getSubjectColor,
  sortByDateAsc,
} from "@/utils/scoreStats";
import { formatShortDate } from "@/utils/date";
import { type ExamRecord } from "@/types";

interface TrendChartProps {
  records: ExamRecord[];
  subjects: string[];
}

// 成绩趋势折线图(SVG)
export default function TrendChart({ records, subjects }: TrendChartProps) {
  const sortedRecords = sortByDateAsc(records);
  const examDates = sortedRecords.map((r) => r.examDate);

  if (examDates.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-forest-bark text-sm">
        暂无数据
      </div>
    );
  }

  // 图表尺寸
  const W = 720;
  const H = 320;
  const padding = { top: 30, right: 30, bottom: 50, left: 45 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  // Y 轴 0-100%
  const yMin = 0;
  const yMax = 100;
  const yToPx = (v: number) =>
    padding.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  // X 轴
  const xToPx = (i: number) =>
    examDates.length === 1
      ? padding.left + innerW / 2
      : padding.left + (i / (examDates.length - 1)) * innerW;

  // 各科目趋势数据
  const trends = subjects.map((subject) => ({
    subject,
    color: getSubjectColor(subject),
    points: getSubjectTrend(records, subject).map((p, i) => ({
      ...p,
      x: xToPx(i),
      y: yToPx(p.rate),
    })),
  }));

  // Y 轴刻度
  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display text-lg text-forest-deep mb-3">📈 各科成绩趋势</h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px]" style={{ height: "auto" }}>
          {/* Y 轴网格线 */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={padding.left}
                y1={yToPx(t)}
                x2={W - padding.right}
                y2={yToPx(t)}
                stroke="rgba(45,95,63,0.12)"
                strokeWidth={1}
                strokeDasharray={t === 60 ? "" : "4 4"}
              />
              <text
                x={padding.left - 8}
                y={yToPx(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#8B6F47"
              >
                {t}
              </text>
            </g>
          ))}
          {/* 60 分及格线标注 */}
          <text
            x={W - padding.right}
            y={yToPx(60) - 6}
            textAnchor="end"
            fontSize="10"
            fill="#8B6F47"
            opacity={0.7}
          >
            及格线
          </text>

          {/* X 轴标签 */}
          {examDates.map((d, i) => (
            <text
              key={d}
              x={xToPx(i)}
              y={H - padding.bottom + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#8B6F47"
            >
              {formatShortDate(d)}
            </text>
          ))}

          {/* 折线 */}
          {trends.map((trend) =>
            trend.points.length > 0 ? (
              <g key={trend.subject}>
                {trend.points.length > 1 && (
                  <polyline
                    points={trend.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={trend.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {trend.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={5} fill="white" stroke={trend.color} strokeWidth={2.5} />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={trend.color}
                    >
                      {p.rate}
                    </text>
                  </g>
                ))}
              </g>
            ) : null
          )}

          {/* 图例 */}
          {subjects.map((s, i) => (
            <g key={s} transform={`translate(${padding.left + i * 90}, 12)`}>
              <circle cx={6} cy={6} r={5} fill="white" stroke={getSubjectColor(s)} strokeWidth={2.5} />
              <text x={16} y={10} fontSize="12" fill="#2D5F3F" fontWeight="500">
                {s}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
