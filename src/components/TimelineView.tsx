import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Check, Pencil } from "lucide-react";
import { getSubjectBg, type Task } from "@/types";
import { isTaskCompletedOnDate, formatChineseDate } from "@/utils/date";
import { useAppStore } from "@/store/useAppStore";

interface TimelineViewProps {
  tasks: Task[];
  dateStr: string;
  onEdit?: (task: Task) => void;
  showDayHeader?: boolean;
  showTimeColumn?: boolean;
}

export const START_HOUR = 6;
export const END_HOUR = 23;
export const HOUR_HEIGHT = 60;

export function formatChineseTime(hour: number): string {
  if (hour === 12) return "正午";
  if (hour < 6) return `${hour}时`;
  if (hour < 12) return `上午${hour}时`;
  if (hour === 13) return "下午1时";
  if (hour < 18) return `下午${hour - 12}时`;
  return `晚上${hour - 12}时`;
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

function getTaskTop(task: Task): number {
  const startTime = parseTime(task.startTime);
  return (startTime - START_HOUR) * HOUR_HEIGHT;
}

function getTaskHeight(task: Task): number {
  const start = parseTime(task.startTime);
  const end = parseTime(task.endTime);
  const duration = end - start;
  return Math.max(duration * HOUR_HEIGHT, 24);
}

interface TaskLayout {
  task: Task;
  column: number;
  totalColumns: number;
}

function calculateTaskLayouts(tasks: Task[]): TaskLayout[] {
  if (tasks.length === 0) return [];

  const sortedTasks = [...tasks].sort((a, b) => {
    const startA = parseTime(a.startTime);
    const startB = parseTime(b.startTime);
    if (startA !== startB) return startA - startB;
    return parseTime(b.endTime) - parseTime(a.endTime);
  });

  const groups: Task[][] = [];
  let currentGroup: Task[] = [];
  let groupEndTime = -Infinity;

  for (const task of sortedTasks) {
    const startTime = parseTime(task.startTime);
    const endTime = parseTime(task.endTime);

    if (currentGroup.length === 0 || startTime < groupEndTime) {
      currentGroup.push(task);
      groupEndTime = Math.max(groupEndTime, endTime);
    } else {
      groups.push(currentGroup);
      currentGroup = [task];
      groupEndTime = endTime;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  const result: TaskLayout[] = [];

  for (const group of groups) {
    const events: Array<{ time: number; type: "start" | "end" }> = [];
    for (const task of group) {
      events.push({ time: parseTime(task.startTime), type: "start" });
      events.push({ time: parseTime(task.endTime), type: "end" });
    }
    events.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      return a.type === "end" ? -1 : 1;
    });

    let maxOverlap = 0;
    let currentOverlap = 0;
    for (const event of events) {
      if (event.type === "start") {
        currentOverlap++;
        maxOverlap = Math.max(maxOverlap, currentOverlap);
      } else {
        currentOverlap--;
      }
    }

    const columnEndTimes: number[] = [];

    for (const task of group) {
      const taskStart = parseTime(task.startTime);
      const taskEnd = parseTime(task.endTime);

      let assignedColumn = -1;
      for (let i = 0; i < columnEndTimes.length; i++) {
        if (columnEndTimes[i] <= taskStart) {
          assignedColumn = i;
          break;
        }
      }

      if (assignedColumn === -1) {
        assignedColumn = columnEndTimes.length;
        columnEndTimes.push(taskEnd);
      } else {
        columnEndTimes[assignedColumn] = taskEnd;
      }

      result.push({
        task,
        column: assignedColumn,
        totalColumns: maxOverlap,
      });
    }
  }

  return result;
}

export default function TimelineView({
  tasks,
  dateStr,
  onEdit,
  showDayHeader = true,
  showTimeColumn = true,
}: TimelineViewProps) {
  const navigate = useNavigate();
  const subjects = useAppStore((s) => s.subjects);
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const taskLayouts = calculateTaskLayouts(tasks);

  const handleTaskClick = (task: Task) => {
    navigate(`/pomodoro?taskId=${task.id}`);
  };

  const getSubjectConfig = (task: Task) => {
    const subject = subjects.find((s) => s.id === task.subject);
    if (subject) {
      return {
        color: subject.color,
        bg: getSubjectBg(subject.color),
        emoji: subject.emoji,
      };
    }
    return {
      color: "#8D99AE",
      bg: "rgba(141,153,174,0.18)",
      emoji: "🌟",
    };
  };

  return (
    <div className={showTimeColumn ? "glass-card overflow-hidden" : "h-full"}>
      {showDayHeader && (
        <div className="px-6 py-4 border-b border-white/40">
          <h2 className="text-xl font-display text-forest-deep text-shadow-forest">
            {formatChineseDate(dateStr)}
          </h2>
        </div>
      )}

      <div className="flex h-full">
        {showTimeColumn && (
          <div className="w-20 flex-shrink-0 border-r border-white/40 bg-white/20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] flex items-center justify-center text-sm font-medium text-forest-deep"
                style={{ minHeight: HOUR_HEIGHT }}
              >
                {formatChineseTime(hour)}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 relative">
          <div className="absolute inset-0 pointer-events-none">
            {hours.slice(0, -1).map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 h-px bg-white/50"
                style={{ top: (hour - START_HOUR + 1) * HOUR_HEIGHT }}
              />
            ))}
            {hours.map((hour) => (
              <div
                key={`half-${hour}`}
                className="absolute left-0 right-0 h-px bg-white/30"
                style={{ top: (hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
              />
            ))}
          </div>

          <div className="relative min-h-[1080px]">
            {taskLayouts.map((layout) => {
              const { task, column, totalColumns } = layout;
              const completed = isTaskCompletedOnDate(task, dateStr);
              const subjectConfig = getSubjectConfig(task);
              const top = getTaskTop(task);
              const height = getTaskHeight(task);

              const columnWidth = 100 / totalColumns;
              const left = column * columnWidth;

              return (
                <div
                  key={task.id}
                  className="absolute z-10"
                  style={{
                    top,
                    height,
                    left: `${left}%`,
                    width: `${columnWidth}%`,
                    padding: "0 2px",
                    boxSizing: "border-box",
                  }}
                  onClick={() => handleTaskClick(task)}
                >
                  <div
                    className={clsx(
                      "h-full w-full rounded-lg cursor-pointer transition-all duration-200 group overflow-hidden",
                      "hover:shadow-glass-lg",
                      completed && "opacity-70"
                    )}
                    style={{
                      background: completed
                        ? "rgba(200, 200, 200, 0.6)"
                        : `linear-gradient(135deg, ${subjectConfig.bg} 0%, rgba(255,255,255,0.6) 100%)`,
                      border: `2px solid ${completed ? "#9CA3AF" : subjectConfig.color}`,
                    }}
                  >
                    <div className="h-full flex items-center gap-1.5 px-2 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (completed) {
                            uncompleteTask(task.id, dateStr);
                          } else {
                            completeTask(task.id, dateStr);
                          }
                        }}
                        className={clsx(
                          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          completed
                            ? "bg-forest-mid border-forest-mid text-white"
                            : "border-white/70 hover:border-forest-mid bg-white/40"
                        )}
                      >
                        {completed && <Check size={12} strokeWidth={3} />}
                      </button>
                      <span
                        className={clsx(
                          "font-medium text-xs truncate flex-1",
                          completed
                            ? "text-strike text-gray-500"
                            : "text-forest-deep"
                        )}
                      >
                        {task.name}
                      </span>
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }}
                          className={clsx(
                            "flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all",
                            "opacity-0 group-hover:opacity-100",
                            completed
                              ? "hover:bg-gray-300 text-gray-500"
                              : "hover:bg-white/60 text-forest-bark hover:text-forest-deep"
                          )}
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
