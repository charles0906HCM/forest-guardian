import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus, Award, Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  getProgress,
  getSubjectAverages,
  getTotalRate,
  sortByDateAsc,
  getAllSubjects,
  isTargetMet,
} from "@/utils/scoreStats";
import TrendChart from "@/components/TrendChart";
import RadarChart from "@/components/RadarChart";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const examRecords = useAppStore((s) => s.examRecords);

  if (examRecords.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
            📈 成绩分析
          </h1>
          <p className="text-forest-bark mt-1 text-sm">分析你的成长轨迹</p>
        </header>
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-display text-xl text-forest-deep">还没有成绩数据</p>
          <p className="text-forest-bark text-sm mt-1">先去成绩单页录入考试成绩吧!</p>
          <button
            onClick={() => navigate("/scores")}
            className="btn-primary mt-4"
          >
            去录入成绩
          </button>
        </div>
      </div>
    );
  }

  const subjects = getAllSubjects(examRecords);
  const averages = getSubjectAverages(examRecords);
  const progress = getProgress(examRecords);
  const sortedRecords = sortByDateAsc(examRecords);

  // 统计摘要
  const allRates = examRecords.map((r) => getTotalRate(r));
  const avgRate = allRates.reduce((a, b) => a + b, 0) / allRates.length;
  const maxRate = Math.max(...allRates);
  const minRate = Math.min(...allRates);
  const examCount = examRecords.length;
  const targetMetCount = examRecords.filter(isTargetMet).length;

  // 最近一次成绩
  const latest = sortedRecords[sortedRecords.length - 1];
  const latestRate = getTotalRate(latest);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
          📈 成绩分析
        </h1>
        <p className="text-forest-bark mt-1 text-sm">分析你的成长轨迹,发现进步空间</p>
      </header>

      {/* 统计摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="考试次数" value={`${examCount}`} icon="📝" color="#3D7B52" />
        <StatCard label="平均得分率" value={`${avgRate.toFixed(1)}%`} icon="📊" color="#7FB069" />
        <StatCard label="最高得分率" value={`${maxRate.toFixed(1)}%`} icon="🏆" color="#F4B942" />
        <StatCard label="目标达成" value={`${targetMetCount}/${examCount}`} icon="🎯" color="#2A9D8F" />
      </div>

      {/* 趋势图 */}
      <TrendChart records={examRecords} subjects={subjects} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 雷达图 */}
        <RadarChart records={examRecords} />

        {/* 进步分析 */}
        <div className="glass-card p-4 md:p-6">
          <h3 className="font-display text-lg text-forest-deep mb-3 flex items-center gap-2">
            <TrendingUp size={18} /> 进步分析
          </h3>
          <p className="text-xs text-forest-bark mb-3">
            最近一次相比上一次的得分率变化
          </p>
          {progress.length === 0 ? (
            <p className="text-sm text-forest-bark text-center py-6">
              至少需要两次考试才能分析进步
            </p>
          ) : (
            <div className="space-y-2">
              {progress.map((p) => (
                <div
                  key={p.subject}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-2xl",
                    p.change > 0
                      ? "bg-forest-mid/10"
                      : p.change < 0
                      ? "bg-berry-red/10"
                      : "bg-white/30"
                  )}
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-white",
                      p.change > 0 ? "bg-forest-mid" : p.change < 0 ? "bg-berry-red" : "bg-forest-bark"
                    )}
                  >
                    {p.change > 0 ? (
                      <TrendingUp size={16} />
                    ) : p.change < 0 ? (
                      <TrendingDown size={16} />
                    ) : (
                      <Minus size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-forest-deep">{p.subject}</div>
                    <div className="text-xs text-forest-bark">
                      {p.prevRate}% → {p.latestRate}%
                    </div>
                  </div>
                  <span
                    className={clsx(
                      "font-display text-lg",
                      p.change > 0 ? "text-forest-mid" : p.change < 0 ? "text-berry-red" : "text-forest-bark"
                    )}
                  >
                    {p.change > 0 ? "+" : ""}
                    {p.change}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 科目平均成绩 */}
      <div className="glass-card p-4 md:p-6">
        <h3 className="font-display text-lg text-forest-deep mb-3 flex items-center gap-2">
          <Award size={18} /> 科目平均成绩
        </h3>
        <div className="space-y-3">
          {averages
            .sort((a, b) => b.avgRate - a.avgRate)
            .map((a) => (
              <div key={a.subject} className="flex items-center gap-3">
                <span className="text-sm font-medium text-forest-deep w-16">{a.subject}</span>
                <div className="flex-1 h-3 rounded-full bg-white/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{
                      width: `${a.avgRate}%`,
                      background:
                        a.avgRate >= 90
                          ? "linear-gradient(90deg, #7FB069, #2A9D8F)"
                          : a.avgRate >= 60
                          ? "linear-gradient(90deg, #F4A261, #7FB069)"
                          : "linear-gradient(90deg, #E76F51, #F4A261)",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {a.avgRate}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-forest-bark w-16 text-right">
                  {a.count} 次考试
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* 最近一次成绩详情 */}
      <div className="glass-card p-4 md:p-6">
        <h3 className="font-display text-lg text-forest-deep mb-3 flex items-center gap-2">
          <Target size={18} /> 最近一次:{latest.examName}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {latest.scores.map((s) => {
            const rate = (s.score / s.fullScore) * 100;
            return (
              <div key={s.id} className="rounded-2xl bg-white/30 p-3 text-center">
                <div className="text-xs text-forest-bark">{s.subject}</div>
                <div className="font-display text-2xl text-forest-deep mt-1">
                  {s.score}
                  <span className="text-sm text-forest-bark">/{s.fullScore}</span>
                </div>
                <div
                  className={clsx(
                    "text-xs font-bold mt-1",
                    rate >= 90 ? "text-forest-mid" : rate >= 60 ? "text-sun-gold" : "text-berry-red"
                  )}
                >
                  {rate.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-display text-2xl" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-forest-bark mt-0.5">{label}</div>
    </div>
  );
}
