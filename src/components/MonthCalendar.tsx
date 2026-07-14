import { clsx } from "clsx";
import { type Task, getSubjectBg } from "@/types";
import { fromISODate, toISODate, addDays, getTasksForDate, todayISO } from "@/utils/date";
import { useAppStore } from "@/store/useAppStore";

interface MonthCalendarProps {
  currentDate: string;
  tasks: Task[];
  onDateClick: (dateStr: string) => void;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function getDaysInMonth(dateStr: string): { date: Date; isoStr: string; isCurrentMonth: boolean }[] {
  const d = fromISODate(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const result: { date: Date; isoStr: string; isCurrentMonth: boolean }[] = [];

  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = addDays(firstDay, -i - 1);
    result.push({
      date: prevDate,
      isoStr: toISODate(prevDate),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const curDate = new Date(year, month, i);
    result.push({
      date: curDate,
      isoStr: toISODate(curDate),
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - result.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = addDays(lastDay, i);
    result.push({
      date: nextDate,
      isoStr: toISODate(nextDate),
      isCurrentMonth: false,
    });
  }

  return result;
}

export default function MonthCalendar({ currentDate, tasks, onDateClick }: MonthCalendarProps) {
  const days = getDaysInMonth(currentDate);
  const today = todayISO();
  const currentMonth = fromISODate(currentDate).getMonth();
  const subjects = useAppStore((s) => s.subjects);

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject) {
      return { color: subject.color, bg: getSubjectBg(subject.color) };
    }
    return { color: "#8D99AE", bg: "rgba(141,153,174,0.18)" };
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-forest-bark py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(({ date, isoStr, isCurrentMonth }) => {
          const dayNum = date.getDate();
          const dayTasks = getTasksForDate(tasks, isoStr);
          const isToday = isoStr === today;
          const isSelected = isoStr === currentDate;
          const isSameMonth = date.getMonth() === currentMonth;

          return (
            <div
              key={isoStr}
              onClick={() => onDateClick(isoStr)}
              className={clsx(
                "relative rounded-xl p-2 min-h-[90px] flex flex-col transition-all duration-200",
                "cursor-pointer hover:bg-white/30",
                isSelected && "bg-white/40 shadow-glass",
                !isSameMonth && "opacity-40"
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1",
                    isToday && "bg-berry-red text-white",
                    !isToday && isSameMonth && "text-forest-deep",
                    !isSameMonth && "text-forest-bark"
                  )}
                >
                  {dayNum}
                </div>
              </div>

              {dayTasks.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {dayTasks.slice(0, 5).map((task, idx) => {
                    const subjectConfig = getSubjectColor(task.subject);
                    const shortName = task.name.slice(0, 4);
                    return (
                      <span
                        key={`${task.id}-${idx}`}
                        className="text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-full"
                        style={{
                          backgroundColor: subjectConfig.bg,
                          color: subjectConfig.color,
                        }}
                        title={task.name}
                      >
                        {shortName}
                      </span>
                    );
                  })}
                  {dayTasks.length > 5 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-forest-bark/60">
                      ...
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}