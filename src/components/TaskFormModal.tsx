import { useState, useEffect } from "react";
import { X, Repeat, Calendar, Clock, Coins, Timer, LayoutGrid, Settings, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import {
  QUADRANT_CONFIG,
  POMODORO_PRESETS,
  getSubjectBg,
  type Task,
  type Quadrant,
  type RepeatType,
  type Subject,
} from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { todayISO, formatChineseDate } from "@/utils/date";
import SubjectManagerModal from "@/components/SubjectManagerModal";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  editingTask?: Task | null;
}

const QUADRANT_KEYS = Object.keys(QUADRANT_CONFIG) as Quadrant[];

export default function TaskFormModal({ open, onClose, editingTask }: TaskFormModalProps) {
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const subjects = useAppStore((s) => s.subjects);

  const [name, setName] = useState("");
  const [quadrant, setQuadrant] = useState<Quadrant>("important-urgent");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [repeatType, setRepeatType] = useState<RepeatType>("none");
  const [repeatEndDate, setRepeatEndDate] = useState("");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [starCoins, setStarCoins] = useState(5);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [subject, setSubject] = useState<Subject>("other");
  const [subjectManagerOpen, setSubjectManagerOpen] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setQuadrant(editingTask.quadrant);
      setSubject(editingTask.subject || "other");
      setStartDate(editingTask.startDate);
      setEndDate(editingTask.endDate);
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
      setRepeatType(editingTask.repeatType);
      setRepeatEndDate(editingTask.repeatEndDate);
      setRepeatDays(editingTask.repeatDays ?? []);
      setStarCoins(editingTask.starCoins);
      setPomodoroMinutes(editingTask.pomodoroMinutes);
      setCustomMinutes(
        POMODORO_PRESETS.includes(editingTask.pomodoroMinutes)
          ? editingTask.pomodoroMinutes
          : editingTask.pomodoroMinutes
      );
    } else {
      setName("");
      setQuadrant("important-urgent");
      setStartDate(todayISO());
      setEndDate(todayISO());
      setStartTime("09:00");
      setEndTime("10:00");
      setRepeatType("none");
      setRepeatEndDate("");
      setRepeatDays([]);
      setStarCoins(5);
      setPomodoroMinutes(25);
      setCustomMinutes(25);
      setSubject("other");
    }
  }, [editingTask, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入任务名称");
      return;
    }
    if (repeatType === "custom" && repeatDays.length === 0) {
      alert("请至少选择一天");
      return;
    }
    const finalMinutes = pomodoroMinutes === 0 ? customMinutes : pomodoroMinutes;
    const taskData = {
      name: name.trim(),
      quadrant,
      subject,
      startDate,
      endDate: repeatType === "none" ? startDate : "",
      startTime,
      endTime,
      repeatType,
      repeatEndDate: repeatType === "none" ? "" : repeatEndDate,
      repeatDays: repeatType === "custom" ? repeatDays : [],
      starCoins,
      pomodoroMinutes: finalMinutes,
    };
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingTask) return;
    if (confirm(`确定删除任务「${editingTask.name}」吗?`)) {
      deleteTask(editingTask.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-forest-deep">
            {editingTask ? "✏️ 修改任务" : "🌱 新建任务"}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/50 flex items-center justify-center text-forest-bark hover:text-forest-deep"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* 任务名称 */}
          <div>
            <label className="block text-sm font-medium text-forest-deep mb-2">任务名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如:完成数学作业"
              className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:border-forest-light focus:outline-none focus:ring-2 focus:ring-forest-light/30 transition-all"
            />
          </div>

          {/* 四象限选择 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
              <LayoutGrid size={15} /> 重要性分类(四象限)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUADRANT_KEYS.map((q) => {
                const config = QUADRANT_CONFIG[q];
                const active = quadrant === q;
                return (
                  <button
                    key={q}
                    onClick={() => setQuadrant(q)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 transition-all text-left",
                      active ? "shadow-glass" : "border-transparent bg-white/30"
                    )}
                    style={{
                      borderColor: active ? config.color : "transparent",
                      background: active ? config.bg : undefined,
                    }}
                  >
                    <span className="text-lg">{config.emoji}</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: active ? config.color : "#8B6F47" }}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 科目分类 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep">
                📚 学科分类
              </label>
              <button
                onClick={() => setSubjectManagerOpen(true)}
                className="flex items-center gap-1 text-xs text-forest-bark hover:text-forest-deep transition-colors"
              >
                <Settings size={12} />
                管理
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {subjects.map((s) => {
                const active = subject === s.id;
                const bg = getSubjectBg(s.color);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSubject(s.id)}
                    className={clsx(
                      "flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all",
                      active ? "shadow-glass" : "border-transparent bg-white/30"
                    )}
                    style={{
                      borderColor: active ? s.color : "transparent",
                      background: active ? bg : undefined,
                    }}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: active ? s.color : "#8B6F47" }}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
                <Calendar size={15} /> 开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:border-forest-light focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
                <Clock size={15} /> 开始-结束时间
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-2xl bg-white/50 border border-white/60 focus:border-forest-light focus:outline-none"
                />
                <span className="text-forest-bark">~</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-2xl bg-white/50 border border-white/60 focus:border-forest-light focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 重复结束日期(仅重复任务) */}
          {repeatType !== "none" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
                <Calendar size={15} /> 重复结束日期
              </label>
              <input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:border-forest-light focus:outline-none"
              />
              <p className="text-xs text-forest-bark mt-1.5">留空则无限重复</p>
            </div>
          )}

          {/* 重复设置 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
              <Repeat size={15} /> 重复选项
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { v: "none", label: "不重复", emoji: "📌" },
                  { v: "daily", label: "每日", emoji: "☀️" },
                  { v: "weekly", label: "每周", emoji: "📅" },
                  { v: "workday", label: "工作日", emoji: "💼" },
                  { v: "custom", label: "自定义", emoji: "⚙️" },
                ] as { v: RepeatType; label: string; emoji: string }[]
              ).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setRepeatType(opt.v)}
                  className={clsx(
                    "flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 transition-all font-medium text-sm",
                    repeatType === opt.v
                      ? "border-forest-mid bg-forest-mid/15 text-forest-deep"
                      : "border-transparent bg-white/30 text-forest-bark"
                  )}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            {repeatType === "custom" && (
              <div className="flex gap-1.5 mt-2">
                {[
                  { day: 1, label: "一" },
                  { day: 2, label: "二" },
                  { day: 3, label: "三" },
                  { day: 4, label: "四" },
                  { day: 5, label: "五" },
                  { day: 6, label: "六" },
                  { day: 0, label: "日" },
                ].map((d) => (
                  <button
                    key={d.day}
                    onClick={() => {
                      setRepeatDays((prev) =>
                        prev.includes(d.day)
                          ? prev.filter((x) => x !== d.day)
                          : [...prev, d.day]
                      );
                    }}
                    className={clsx(
                      "w-10 h-10 rounded-full border-2 transition-all font-medium text-sm",
                      repeatDays.includes(d.day)
                        ? "border-forest-mid bg-forest-mid/15 text-forest-deep"
                        : "border-transparent bg-white/30 text-forest-bark"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
            {repeatType !== "none" && (
              <p className="text-xs text-forest-bark mt-2">
                {repeatType === "daily" ? "每日" : repeatType === "weekly" ? "每周同一天" : repeatType === "workday" ? "工作日（周一至周五）" : "每周选定的日子"}重复,直到{" "}
                {repeatEndDate ? formatChineseDate(repeatEndDate) : "未设置结束日期"}
              </p>
            )}
          </div>

          {/* 星愿币 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
              <Coins size={15} /> 完成奖励星愿币
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={50}
                value={starCoins}
                onChange={(e) => setStarCoins(Number(e.target.value))}
                className="flex-1 accent-forest-mid"
              />
              <StarCoinPreview amount={starCoins} />
            </div>
          </div>

          {/* 番茄钟时长 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-forest-deep mb-2">
              <Timer size={15} /> 番茄钟专注时长
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {POMODORO_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setPomodoroMinutes(m);
                    setCustomMinutes(m);
                  }}
                  className={clsx(
                    "py-3 rounded-2xl border-2 transition-all font-bold",
                    pomodoroMinutes === m
                      ? "border-berry-red bg-berry-red/15 text-berry-red"
                      : "border-transparent bg-white/30 text-forest-bark"
                  )}
                >
                  {m}分
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-forest-bark">自定义:</span>
              <input
                type="number"
                min={1}
                max={120}
                value={customMinutes}
                onChange={(e) => {
                  const v = Math.max(1, Number(e.target.value) || 1);
                  setCustomMinutes(v);
                  setPomodoroMinutes(POMODORO_PRESETS.includes(v) ? v : 0);
                }}
                className="w-24 px-3 py-2 rounded-xl bg-white/50 border border-white/60 focus:border-forest-light focus:outline-none"
              />
              <span className="text-sm text-forest-bark">分钟</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-8">
          {editingTask && (
            <button
              onClick={handleDelete}
              className="glass-btn flex items-center justify-center gap-1.5 px-4 text-berry-red hover:bg-berry-red/10"
            >
              <Trash2 size={16} />
              删除
            </button>
          )}
          <button onClick={onClose} className="flex-1 glass-btn">
            取消
          </button>
          <button onClick={handleSave} className="flex-1 btn-primary dew-hover">
            {editingTask ? "保存修改" : "创建任务"}
          </button>
        </div>
      </div>

      <SubjectManagerModal
        open={subjectManagerOpen}
        onClose={() => setSubjectManagerOpen(false)}
      />
    </div>
  );
}

function StarCoinPreview({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-gradient-to-r from-sun-light/90 to-sun-gold/90 border border-white/60 font-bold text-forest-deep min-w-[80px] justify-center">
      <span>⭐</span>
      <span>{amount}</span>
    </div>
  );
}
