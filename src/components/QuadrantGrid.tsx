import { clsx } from "clsx";
import { QUADRANT_CONFIG, type Quadrant, type Task } from "@/types";
import { isTaskCompletedOnDate } from "@/utils/date";

interface QuadrantGridProps {
  tasks: Task[];
  dateStr: string;
  onSelectQuadrant: (q: Quadrant | "all") => void;
  activeQuadrant: Quadrant | "all";
}

const QUADRANT_ORDER: Quadrant[] = [
  "important-urgent",
  "important-not-urgent",
  "not-important-urgent",
  "not-important-not-urgent",
];

export default function QuadrantGrid({
  tasks,
  dateStr,
  onSelectQuadrant,
  activeQuadrant,
}: QuadrantGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {QUADRANT_ORDER.map((q) => {
        const config = QUADRANT_CONFIG[q];
        const quadrantTasks = tasks.filter((t) => t.quadrant === q);
        const done = quadrantTasks.filter((t) =>
          isTaskCompletedOnDate(t, dateStr)
        ).length;
        const total = quadrantTasks.length;
        const active = activeQuadrant === q;

        return (
          <button
            key={q}
            onClick={() => onSelectQuadrant(active ? "all" : q)}
            className={clsx(
              "relative rounded-3xl p-4 md:p-5 text-left transition-all duration-300 overflow-hidden",
              "border backdrop-blur-2xl",
              active ? "scale-[1.02] shadow-glass-lg" : "hover:scale-[1.01] shadow-glass",
              "dew-hover"
            )}
            style={{
              background: config.bg,
              borderColor: active ? config.color : "rgba(255,255,255,0.5)",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                style={{ background: "rgba(255,255,255,0.6)" }}
              >
                {config.emoji}
              </div>
              <span
                className="text-2xl font-display"
                style={{ color: config.color }}
              >
                {total}
              </span>
            </div>
            <h3
              className="font-display text-sm md:text-base leading-tight"
              style={{ color: config.color }}
            >
              {config.label}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-forest-bark">
              <span>已完成 {done}/{total}</span>
              {total > 0 && (
                <div className="flex-1 h-1.5 rounded-full bg-white/40 overflow-hidden ml-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(done / total) * 100}%`,
                      background: config.color,
                    }}
                  />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
