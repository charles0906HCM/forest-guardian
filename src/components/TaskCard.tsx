import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Check, Clock, Pencil, Trash2, Timer } from "lucide-react";
import { QUADRANT_CONFIG, getSubjectBg, type Task } from "@/types";
import { isTaskCompletedOnDate, repeatTypeLabel } from "@/utils/date";
import { useAppStore } from "@/store/useAppStore";
import StarCoinBadge from "@/components/StarCoinBadge";

interface TaskCardProps {
  task: Task;
  dateStr: string;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

export default function TaskCard({ task, dateStr, onEdit, compact = false }: TaskCardProps) {
  const navigate = useNavigate();
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const subjects = useAppStore((s) => s.subjects);
  const config = QUADRANT_CONFIG[task.quadrant];
  const completed = isTaskCompletedOnDate(task, dateStr);
  const subjectItem = subjects.find((s) => s.id === task.subject) || subjects[0];
  const subjectBg = getSubjectBg(subjectItem?.color || "#8D99AE");

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completed) {
      uncompleteTask(task.id, dateStr);
    } else {
      completeTask(task.id, dateStr);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 点击任务名称连接番茄钟
    navigate(`/pomodoro?taskId=${task.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除任务「${task.name}」吗?`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div
      className={clsx(
        "glass-card p-4 transition-all duration-300 relative overflow-hidden",
        "hover:shadow-glass-lg hover:-translate-y-0.5",
        completed && "opacity-70"
      )}
      style={{ borderLeft: `4px solid ${config.color}` }}
    >
      <div className="flex items-start gap-3">
        {/* 完成勾选 */}
        <button
          onClick={handleToggle}
          className={clsx(
            "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
            completed
              ? "bg-forest-mid border-forest-mid text-white"
              : "border-forest-light/60 hover:border-forest-mid bg-white/40"
          )}
        >
          {completed && <Check size={16} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          {/* 任务名称 - 点击连接番茄钟 */}
          <button
            onClick={handleNameClick}
            className={clsx(
              "font-medium text-left hover:text-forest-mid transition-colors flex items-center gap-1.5 group",
              completed && "text-strike text-forest-bark"
            )}
            title="点击启动番茄钟"
          >
            <span className={clsx("text-forest-deep", completed && "text-forest-bark")}>
              {task.name}
            </span>
            <Timer
              size={14}
              className="text-forest-light opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          {!compact && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-forest-bark">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {task.startTime}-{task.endTime}
              </span>
              <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: subjectBg, color: subjectItem?.color || "#8D99AE" }}
                >
                  {subjectItem?.emoji || "🌟"} {subjectItem?.label || "其他"}
                </span>
              {task.repeatType !== "none" && (
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ background: config.bg, color: config.color }}
                >
                  {repeatTypeLabel(task.repeatType)}
                </span>
              )}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: config.bg, color: config.color }}
              >
                {config.emoji} {config.shortLabel}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <StarCoinBadge amount={task.starCoins} size="sm" />
            <span className="inline-flex items-center gap-1 text-xs text-forest-bark bg-white/40 px-2 py-0.5 rounded-full">
              <Timer size={11} /> {task.pomodoroMinutes}分钟
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="w-7 h-7 rounded-lg hover:bg-white/50 flex items-center justify-center text-forest-bark hover:text-forest-deep transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-lg hover:bg-berry-red/20 flex items-center justify-center text-forest-bark hover:text-berry-red transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
