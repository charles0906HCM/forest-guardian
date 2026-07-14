import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Plus, Trash2, Target, Award, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { todayISO, formatChineseDate } from "@/utils/date";
import {
  getTotal,
  getTotalFull,
  getTotalRate,
  getGrade,
  isTargetMet,
} from "@/utils/scoreStats";
import { DEFAULT_SUBJECTS, type ExamRecord, type ExamScore } from "@/types";

export default function ScoresPage() {
  const navigate = useNavigate();
  const examRecords = useAppStore((s) => s.examRecords);
  const addExamRecord = useAppStore((s) => s.addExamRecord);
  const deleteExamRecord = useAppStore((s) => s.deleteExamRecord);
  const claimExamReward = useAppStore((s) => s.claimExamReward);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const subjects = Array.from(
    new Set(examRecords.flatMap((r) => r.scores.map((s) => s.subject)))
  );
  const allSubjects = Array.from(
    new Set([...DEFAULT_SUBJECTS.map((s) => s.label), ...subjects])
  );

  const sortedRecords = [...examRecords].sort((a, b) =>
    b.examDate.localeCompare(a.examDate)
  );

  const filteredRecords =
    filterSubject === "all"
      ? sortedRecords
      : sortedRecords.filter((r) =>
          r.scores.some((s) => s.subject === filterSubject)
        );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
            📊 成绩单记录
          </h1>
          <p className="text-forest-bark mt-1 text-sm">记录每次考试,见证你的成长</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/analysis")}
            className="glass-btn py-2 px-3 text-sm"
          >
            📈 成绩分析
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={18} />
            <span className="hidden sm:inline">录入成绩</span>
          </button>
        </div>
      </header>

      {/* 科目筛选 */}
      {examRecords.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterSubject("all")}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filterSubject === "all"
                ? "bg-forest-mid text-white shadow-glass"
                : "glass text-forest-deep"
            )}
          >
            全部
          </button>
          {allSubjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                filterSubject === s
                  ? "bg-forest-mid text-white shadow-glass"
                  : "glass text-forest-deep"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 成绩列表 */}
      {filteredRecords.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-display text-xl text-forest-deep">还没有成绩记录</p>
          <p className="text-forest-bark text-sm mt-1">点击「录入成绩」记录第一次考试吧!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <ExamCard
              key={record.id}
              record={record}
              onDelete={() => {
                if (confirm(`确定删除「${record.examName}」吗?`)) {
                  deleteExamRecord(record.id);
                }
              }}
              onClaimReward={() => claimExamReward(record.id)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ExamFormModal
          onClose={() => setModalOpen(false)}
          onSave={(r) => {
            addExamRecord(r);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// 考试成绩卡片
function ExamCard({
  record,
  onDelete,
  onClaimReward,
}: {
  record: ExamRecord;
  onDelete: () => void;
  onClaimReward: () => void;
}) {
  const total = getTotal(record);
  const totalFull = getTotalFull(record);
  const rate = getTotalRate(record);
  const grade = getGrade(rate);
  const met = isTargetMet(record);

  return (
    <div className="glass-card p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg text-forest-deep">{record.examName}</h3>
          <p className="text-xs text-forest-bark mt-0.5">
            {formatChineseDate(record.examDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: grade.color }}
          >
            {grade.label}
          </span>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg hover:bg-berry-red/20 text-forest-bark hover:text-berry-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 各科分数 */}
      <div className="space-y-2 mb-3">
        {record.scores.map((s) => {
          const subjectRate = (s.score / s.fullScore) * 100;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <span className="text-sm text-forest-deep w-12 flex-shrink-0">{s.subject}</span>
              <div className="flex-1 h-2 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${subjectRate}%`,
                    background:
                      subjectRate >= 90
                        ? "#2A9D8F"
                        : subjectRate >= 60
                        ? "#7FB069"
                        : "#E76F51",
                  }}
                />
              </div>
              <span className="text-xs font-medium text-forest-deep w-20 text-right">
                {s.score}/{s.fullScore}
                {s.rank ? ` (#{s.rank})` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* 总分与得分率 */}
      <div className="flex items-center justify-between pt-3 border-t border-white/40">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-forest-bark">
            总分: <span className="font-bold text-forest-deep">{total}/{totalFull}</span>
          </span>
          <span className="text-forest-bark">
            得分率: <span className="font-bold" style={{ color: grade.color }}>{rate}%</span>
          </span>
        </div>
      </div>

      {/* 目标与奖励 */}
      {record.rewardCoins > 0 && (
        <div className="mt-3 p-2.5 rounded-2xl bg-white/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Target size={14} className="text-forest-mid" />
            <span className="text-forest-bark">
              目标 {record.targetScore}% {met ? "✅ 已达成" : "❌ 未达成"}
            </span>
          </div>
          {met && !record.rewardClaimed ? (
            <button onClick={onClaimReward} className="btn-gold py-1 px-3 text-xs">
              <Award size={12} className="inline mr-1" />
              领取 +{record.rewardCoins}⭐
            </button>
          ) : record.rewardClaimed ? (
            <span className="text-xs text-forest-mid font-medium">已领取 ⭐{record.rewardCoins}</span>
          ) : (
            <span className="text-xs text-forest-bark">奖励 {record.rewardCoins}⭐</span>
          )}
        </div>
      )}
    </div>
  );
}

// 成绩录入弹窗
function ExamFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (r: Omit<ExamRecord, "id" | "createdAt" | "rewardClaimed">) => void;
}) {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(todayISO());
  const [targetScore, setTargetScore] = useState(85);
  const [rewardCoins, setRewardCoins] = useState(10);
  const [scores, setScores] = useState<ExamScore[]>(
    DEFAULT_SUBJECTS.filter((s) => s.id !== "other").map((s, i) => ({
      id: `tmp-${i}`,
      subject: s.label,
      score: 0,
      fullScore: 100,
    }))
  );

  const updateScore = (id: string, field: keyof ExamScore, value: string | number) => {
    setScores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSubject = () => {
    const name = prompt("请输入科目名称:");
    if (name && !scores.some((s) => s.subject === name)) {
      setScores([...scores, { id: `tmp-${Date.now()}`, subject: name, score: 0, fullScore: 100 }]);
    }
  };

  const handleSave = () => {
    if (!examName.trim()) {
      alert("请输入考试名称");
      return;
    }
    const validScores = scores.filter((s) => s.score > 0 || s.fullScore > 0);
    if (validScores.length === 0) {
      alert("请至少录入一科成绩");
      return;
    }
    onSave({
      examName: examName.trim(),
      examDate,
      scores: validScores,
      targetScore,
      rewardCoins,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-forest-deep">📝 录入考试成绩</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-forest-deep">考试名称</label>
              <input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="如期中考试、第一单元测试"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-deep">考试日期</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
              />
            </div>
          </div>

          {/* 各科成绩 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-forest-deep">各科成绩</label>
              <button onClick={addSubject} className="text-xs text-forest-mid hover:underline">
                + 添加科目
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-forest-bark px-2">
                <span className="col-span-3">科目</span>
                <span className="col-span-3 text-center">得分</span>
                <span className="col-span-3 text-center">满分</span>
                <span className="col-span-3 text-center">排名(选填)</span>
              </div>
              {scores.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={s.subject}
                    onChange={(e) => updateScore(s.id, "subject", e.target.value)}
                    className="col-span-3 px-2 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={s.score}
                    onChange={(e) => updateScore(s.id, "score", Number(e.target.value))}
                    className="col-span-3 px-2 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none text-sm text-center"
                  />
                  <input
                    type="number"
                    value={s.fullScore}
                    onChange={(e) => updateScore(s.id, "fullScore", Number(e.target.value))}
                    className="col-span-3 px-2 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="-"
                    value={s.rank ?? ""}
                    onChange={(e) =>
                      updateScore(s.id, "rank", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="col-span-3 px-2 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none text-sm text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 目标与奖励 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-forest-deep flex items-center gap-1">
                <Target size={14} /> 目标得分率 (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={targetScore}
                onChange={(e) => setTargetScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-deep flex items-center gap-1">
                <Award size={14} /> 达成奖励星愿币
              </label>
              <input
                type="number"
                min={0}
                value={rewardCoins}
                onChange={(e) => setRewardCoins(Math.max(0, Number(e.target.value)))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="w-full btn-primary mt-6">
          保存成绩
        </button>
      </div>
    </div>
  );
}
