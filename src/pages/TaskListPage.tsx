import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar, LayoutList, LayoutGrid, CalendarDays } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  getTasksForDate,
  getTasksForRange,
  getWeekRange,
  getMonthRange,
  todayISO,
  formatChineseDate,
  formatWeekTitle,
  formatMonthTitle,
  addDays,
  toISODate,
  fromISODate,
} from "@/utils/date";
import { QUADRANT_CONFIG, getSubjectBg, type Quadrant, type Task, type Subject } from "@/types";
import QuadrantGrid from "@/components/QuadrantGrid";
import TaskFormModal from "@/components/TaskFormModal";
import TimelineView, { START_HOUR, END_HOUR, HOUR_HEIGHT, formatChineseTime } from "@/components/TimelineView";
import MonthCalendar from "@/components/MonthCalendar";
import WaterCupIcon from "@/components/WaterCupIcon";
import EmptyCupIcon from "@/components/EmptyCupIcon";

type ViewType = "day" | "week" | "month";

const WATER_GOAL = 8;

export default function TaskListPage() {
  const tasks = useAppStore((s) => s.tasks);
  const subjects = useAppStore((s) => s.subjects);
  const todayWaterCount = useAppStore((s) => s.todayWaterCount);
  const habits = useAppStore((s) => s.habits);
  const triggerHabit = useAppStore((s) => s.triggerHabit);
  const cancelHabit = useAppStore((s) => s.cancelHabit);

  const waterHabit = habits.find(h => h.name === "喝水");

  const handleWaterClick = (index: number) => {
    if (!waterHabit) return;
    if (index < todayWaterCount) {
      cancelHabit(waterHabit.id);
    } else {
      triggerHabit(waterHabit.id);
    }
  };
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [viewType, setViewType] = useState<ViewType>("day");
  const [activeQuadrant, setActiveQuadrant] = useState<Quadrant | "all">("all");
  const [activeSubject, setActiveSubject] = useState<Subject | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const weekRange = getWeekRange(selectedDate);
  const monthRange = getMonthRange(selectedDate);

  let dayTasks: Task[];
  if (viewType === "day") {
    dayTasks = getTasksForDate(tasks, selectedDate);
  } else if (viewType === "week") {
    dayTasks = getTasksForRange(tasks, weekRange.start, weekRange.end);
  } else {
    dayTasks = getTasksForRange(tasks, monthRange.start, monthRange.end);
  }

  const filteredTasks = dayTasks
    .filter((t) => (activeQuadrant === "all" ? true : t.quadrant === activeQuadrant))
    .filter((t) => (activeSubject === "all" ? true : t.subject === activeSubject));

  const isToday = selectedDate === todayISO();

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const shiftDate = (delta: number) => {
    const d = addDays(
      new Date(selectedDate.split("-").map(Number).reduce((acc, v, i) => {
        if (i === 0) acc.setFullYear(v);
        if (i === 1) acc.setMonth(v - 1);
        if (i === 2) acc.setDate(v);
        return acc;
      }, new Date())),
      viewType === "day" ? delta : viewType === "week" ? delta * 7 : delta * 30
    );
    setSelectedDate(toISODate(d));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setViewType("day");
  };

  const handleToday = () => {
    setSelectedDate(todayISO());
    setViewType("day");
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(weekRange.start.split("-").map(Number).reduce((acc, v, i) => {
      if (i === 0) acc.setFullYear(v);
      if (i === 1) acc.setMonth(v - 1);
      if (i === 2) acc.setDate(v);
      return acc;
    }, new Date()));
    for (let i = 0; i < 7; i++) {
      days.push(toISODate(addDays(start, i)));
    }
    return days;
  };

  const weekDays = getWeekDays();

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest flex flex-wrap items-center gap-1">
            🌲 {viewType === "day" ? "今日" : viewType === "week" ? "本周" : "本月"}任务森林
            <div className="flex gap-0.5 ml-2">
              {Array.from({ length: Math.max(WATER_GOAL, todayWaterCount) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleWaterClick(i)}
                  className="p-0.5 hover:bg-white/30 rounded-lg transition-colors"
                >
                  {i < todayWaterCount ? (
                    <WaterCupIcon size={24} />
                  ) : (
                    <EmptyCupIcon size={24} />
                  )}
                </button>
              ))}
            </div>
          </h1>
          <p className="text-forest-bark mt-1 text-sm">完成任务,收获星愿币,守护你的森林</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="glass-card flex items-center gap-1 px-2 py-1.5">
            {([
              { v: "day" as ViewType, label: "日", icon: LayoutList },
              { v: "week" as ViewType, label: "周", icon: LayoutGrid },
              { v: "month" as ViewType, label: "月", icon: CalendarDays },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setViewType(opt.v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${
                  viewType === opt.v
                    ? "bg-forest-mid/20 text-forest-deep"
                    : "text-forest-bark hover:text-forest-deep hover:bg-white/30"
                }`}
              >
                <opt.icon size={16} />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="glass-card flex items-center gap-2 px-3 py-2">
            <button
              onClick={() => shiftDate(-1)}
              className="w-8 h-8 rounded-xl hover:bg-white/50 flex items-center justify-center text-forest-deep"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center">
              <Calendar size={16} className="text-forest-mid" />
              <span className="text-sm font-medium text-forest-deep">
                {isToday && viewType === "day" && "今天 · "}
                {viewType === "day"
                  ? formatChineseDate(selectedDate)
                  : viewType === "week"
                  ? formatWeekTitle(selectedDate)
                  : formatMonthTitle(selectedDate)}
              </span>
            </div>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-forest-bark hover:text-forest-deep hover:bg-white/40 transition-all"
            >
              今天
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="w-8 h-8 rounded-xl hover:bg-white/50 flex items-center justify-center text-forest-deep"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={handleNewTask}
            className="btn-primary dew-hover flex items-center gap-1.5"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">新建任务</span>
          </button>
        </div>
      </header>

      {viewType === "day" && (
        <QuadrantGrid
          tasks={dayTasks}
          dateStr={selectedDate}
          onSelectQuadrant={setActiveQuadrant}
          activeQuadrant={activeQuadrant}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl text-forest-deep flex items-center gap-2">
            {activeQuadrant === "all" ? (
              <>📋 全部任务 ({filteredTasks.length})</>
            ) : (
              <>
                {QUADRANT_CONFIG[activeQuadrant].emoji} {QUADRANT_CONFIG[activeQuadrant].label} ({filteredTasks.length})
              </>
            )}
          </h2>

          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveSubject("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeSubject === "all"
                  ? "bg-forest-mid text-white"
                  : "bg-white/40 text-forest-bark hover:bg-white/60"
              }`}
            >
              全部科目
            </button>
            {(subjects).map((s) => {
              const bg = getSubjectBg(s.color);
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSubject(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    activeSubject === s.id
                      ? "text-white"
                      : "bg-white/40 text-forest-bark hover:bg-white/60"
                  }`}
                  style={{
                    backgroundColor: activeSubject === s.id ? s.color : undefined,
                  }}
                >
                  {s.emoji} {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {viewType !== "day" && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveQuadrant("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeQuadrant === "all"
                  ? "bg-forest-mid text-white"
                  : "bg-white/40 text-forest-bark hover:bg-white/60"
              }`}
            >
              全部象限
            </button>
            {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map((q) => {
              const config = QUADRANT_CONFIG[q];
              return (
                <button
                  key={q}
                  onClick={() => setActiveQuadrant(q)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    activeQuadrant === q
                      ? "text-white"
                      : "bg-white/40 text-forest-bark hover:bg-white/60"
                  }`}
                  style={{
                    backgroundColor: activeQuadrant === q ? config.color : undefined,
                  }}
                >
                  {config.emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {viewType === "day" && (
        <TimelineView
          tasks={filteredTasks}
          dateStr={selectedDate}
          onEdit={handleEdit}
          showDayHeader={true}
        />
      )}

      {viewType === "week" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-auto rounded-2xl relative isolate" style={{ maxHeight: "75vh", WebkitOverflowScrolling: "touch", transform: "translateZ(0)" }}>
            {/* 星期标题行 - sticky top-0 固定在顶部 */}
            <div className="flex sticky top-0 z-30 bg-forest-light" style={{ position: "-webkit-sticky" }}>
              {/* 左上角"时间"标题格 - sticky top-0 left-0 固定在左上角 */}
              <div className="w-20 flex-shrink-0 sticky top-0 left-0 z-40 py-3 text-center text-sm font-medium text-forest-bark bg-forest-light border-r border-white/40 border-b border-white/40" style={{ position: "-webkit-sticky" }}>
                <div>时间</div>
                <div className="text-xs">&nbsp;</div>
              </div>
              {/* 7天标题 */}
              {weekDays.map((day) => {
                const dayDate = fromISODate(day);
                const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
                const isSelectedDay = day === selectedDate;
                const isTodayDay = day === todayISO();
                return (
                  <div
                    key={day}
                    className={`flex-1 min-w-[120px] py-3 text-center border-r border-white/40 border-b border-white/40 bg-forest-light relative`}
                  >
                    {isSelectedDay && <div className="absolute inset-0 bg-forest-mid/30 pointer-events-none" />}
                    <div className="relative z-10">
                      <div
                        className={`text-sm font-medium ${
                          isTodayDay ? "text-forest-mid" : "text-forest-deep"
                        }`}
                      >
                        {weekdayNames[dayDate.getDay()]}
                      </div>
                      <div className="text-xs text-forest-bark">
                        {dayDate.getMonth() + 1}/{dayDate.getDate()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 主体：时间列 + 7天列，在同一个滚动容器中 */}
            <div className="flex">
              {/* 固定时间列 - sticky left-0 */}
              <div className="w-20 flex-shrink-0 sticky left-0 z-20 bg-forest-light border-r border-white/40" style={{ position: "-webkit-sticky" }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] flex items-center justify-center text-sm font-medium text-forest-deep border-b border-white/20"
                    style={{ minHeight: HOUR_HEIGHT }}
                  >
                    {formatChineseTime(hour)}
                  </div>
                ))}
              </div>

              {/* 7天内容列 */}
              <div className="flex flex-1 bg-forest-light">
                {weekDays.map((day) => {
                  const dayDate = fromISODate(day);
                  const isSelectedDay = day === selectedDate;
                  const dayFilteredTasks = filteredTasks.filter(
                    (t) => getTasksForDate([t], day).length > 0
                  );
                  return (
                    <div
                      key={day}
                      className={`flex-1 min-w-[120px] border-r border-white/40 bg-forest-light relative`}
                    >
                      {isSelectedDay && <div className="absolute inset-0 bg-forest-mid/30 pointer-events-none" />}
                      <div className="relative z-10">
                        <TimelineView
                          tasks={dayFilteredTasks}
                          dateStr={day}
                          onEdit={handleEdit}
                          showDayHeader={false}
                          showTimeColumn={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewType === "month" && (
        <MonthCalendar
          currentDate={selectedDate}
          tasks={filteredTasks}
          onDateClick={handleDateClick}
        />
      )}

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTask={editingTask}
      />
    </div>
  );
}