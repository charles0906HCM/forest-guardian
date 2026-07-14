import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { clsx } from "clsx";
import { Play, Pause, RotateCcw, Check, Coins } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { POMODORO_PRESETS, type Task } from "@/types";
import { getTasksForDate, todayISO, isTaskCompletedOnDate } from "@/utils/date";
import { playFinishSound, initAudioContext } from "@/utils/sound";
import {
  requestNotificationPermission,
  sendPomodoroFinishedNotification,
  sendPomodoroTickNotification,
} from "@/utils/notifications";
import {
  savePomodoroState,
  loadPomodoroState,
  clearPomodoroState,
} from "@/utils/pomodoro";
import StarCoinBadge from "@/components/StarCoinBadge";
import WaterCupIcon from "@/components/WaterCupIcon";
import EmptyCupIcon from "@/components/EmptyCupIcon";
import type { PomodoroWorkerMessage, PomodoroWorkerResponse } from "@/workers/pomodoro.worker";

const WATER_GOAL = 8;

export default function PomodoroPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tasks = useAppStore((s) => s.tasks);
  const todayWaterCount = useAppStore((s) => s.todayWaterCount);
  const habits = useAppStore((s) => s.habits);
  const triggerHabit = useAppStore((s) => s.triggerHabit);
  const cancelHabit = useAppStore((s) => s.cancelHabit);
  const recordPomodoro = useAppStore((s) => s.recordPomodoro);
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);

  const waterHabit = habits.find(h => h.name === "喝水");

  const handleWaterClick = (index: number) => {
    if (!waterHabit) return;
    if (index < todayWaterCount) {
      cancelHabit(waterHabit.id);
    } else {
      triggerHabit(waterHabit.id);
    }
  };

  const taskId = searchParams.get("taskId");
  const todayTasks = getTasksForDate(tasks, todayISO());

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    taskId ?? (todayTasks[0]?.id ?? null)
  );
  const [minutes, setMinutes] = useState<number>(() => {
    const t = tasks.find((x) => x.id === taskId);
    return t?.pomodoroMinutes ?? 25;
  });
  const [customMinutes, setCustomMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const t = tasks.find((x) => x.id === taskId);
    return (t?.pomodoroMinutes ?? 25) * 60;
  });
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [coinAnim, setCoinAnim] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<number | null>(null);
  const [workerAvailable, setWorkerAvailable] = useState(true);
  const startTimeRef = useRef<number>(Date.now());
  const [showCompleted, setShowCompleted] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) as Task | undefined;

  const uncompletedTasks = todayTasks.filter((t) => !isTaskCompletedOnDate(t, todayISO()));
  const completedTasks = todayTasks.filter((t) => isTaskCompletedOnDate(t, todayISO()));
  const taskCompleted = selectedTask
    ? isTaskCompletedOnDate(selectedTask, todayISO())
    : false;

  // 启动计时器（Web Worker 或 setInterval）
  const startTimer = useCallback((remainingSeconds: number) => {
    if (workerAvailable && workerRef.current) {
      workerRef.current.postMessage({
        type: "start",
        seconds: remainingSeconds,
      } as PomodoroWorkerMessage);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      let remaining = remainingSeconds;
      timerRef.current = window.setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setRunning(false);
          setFinished(true);
          setSecondsLeft(0);
          clearPomodoroState();
        } else {
          setSecondsLeft(remaining);
          if (document.hidden) {
            sendPomodoroTickNotification(remaining, selectedTask?.name);
          }
        }
      }, 1000);
    }
  }, [workerAvailable, selectedTask]);

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (running && secondsLeft > 0) {
          savePomodoroState({
            running,
            secondsLeft,
            startTime: startTimeRef.current,
            totalSeconds: minutes * 60,
          });
        }
      } else {
        const savedState = loadPomodoroState();
        if (savedState && savedState.running) {
          const now = Date.now();
          const elapsed = Math.floor((now - savedState.startTime) / 1000);
          const remaining = Math.max(0, savedState.secondsLeft - elapsed);
          
          setSecondsLeft(remaining);
          setMinutes(Math.ceil(savedState.totalSeconds / 60));
          setCustomMinutes(Math.ceil(savedState.totalSeconds / 60));
          
          if (remaining > 0) {
            startTimeRef.current = now - elapsed * 1000;
            setRunning(true);
            setFinished(false);
            startTimer(remaining);
          } else {
            setRunning(false);
            setFinished(true);
            setSecondsLeft(0);
            clearPomodoroState();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [running, secondsLeft, minutes, startTimer]);

  // 初始化 Web Worker
  useEffect(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL("../workers/pomodoro.worker.ts", import.meta.url)
        );
        workerRef.current.onmessage = (e: MessageEvent<PomodoroWorkerResponse>) => {
          if (e.data.type === "tick") {
            setSecondsLeft(e.data.secondsLeft);
            if (document.hidden) {
              sendPomodoroTickNotification(e.data.secondsLeft, selectedTask?.name);
            }
          } else if (e.data.type === "finished") {
            setRunning(false);
            setFinished(true);
            setSecondsLeft(0);
            clearPomodoroState();
          }
        };
        workerRef.current.onerror = () => {
          setWorkerAvailable(false);
        };
      } catch {
        setWorkerAvailable(false);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "stop" } as PomodoroWorkerMessage);
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (running && secondsLeft > 0) {
        savePomodoroState({
          running,
          secondsLeft,
          startTime: startTimeRef.current,
          totalSeconds: minutes * 60,
        });
      }
    };
  }, []);

  // 页面首次加载时恢复状态
  useEffect(() => {
    const savedState = loadPomodoroState();
    if (savedState) {
      const now = Date.now();
      const elapsed = Math.floor((now - savedState.startTime) / 1000);
      const remaining = Math.max(0, savedState.secondsLeft - elapsed);
      
      setSecondsLeft(remaining);
      setMinutes(Math.ceil(savedState.totalSeconds / 60));
      setCustomMinutes(Math.ceil(savedState.totalSeconds / 60));
      
      if (savedState.running && remaining > 0) {
        startTimeRef.current = now - elapsed * 1000;
        setRunning(true);
        setFinished(false);
        setTimeout(() => startTimer(remaining), 100);
      } else if (remaining <= 0) {
        setRunning(false);
        setFinished(true);
        setSecondsLeft(0);
        clearPomodoroState();
      }
    }
  }, [startTimer]);

  // 当切换任务时,同步番茄钟时长
  const handleSelectTask = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    setSelectedTaskId(id);
    if (t) {
      setMinutes(t.pomodoroMinutes);
      setSecondsLeft(t.pomodoroMinutes * 60);
      setRunning(false);
      setFinished(false);
      if (workerAvailable && workerRef.current) {
        workerRef.current.postMessage({
          type: "reset",
          seconds: t.pomodoroMinutes * 60,
        } as PomodoroWorkerMessage);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    setSearchParams(id ? { taskId: id } : {});
  };

  // 当分钟变化时重置秒数(非运行时)
  useEffect(() => {
    if (!running) {
      setSecondsLeft(minutes * 60);
      setFinished(false);
      if (workerAvailable && workerRef.current) {
        workerRef.current.postMessage({
          type: "reset",
          seconds: minutes * 60,
        } as PomodoroWorkerMessage);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [minutes, running, workerAvailable]);

  // 完成处理
  const handleFinish = useCallback(() => {
    clearPomodoroState();
    playFinishSound();
    sendPomodoroFinishedNotification(selectedTask?.name);
    if (!selectedTask) return;
    recordPomodoro(selectedTask.id, minutes);
    if (!taskCompleted) {
      completeTask(selectedTask.id, todayISO());
    }
    setCoinAnim(true);
    setTimeout(() => setCoinAnim(false), 2500);
  }, [selectedTask, minutes, recordPomodoro, completeTask, taskCompleted]);

  useEffect(() => {
    if (finished) {
      handleFinish();
    }
  }, [finished, handleFinish]);

  const handleStart = async () => {
    initAudioContext();
    await requestNotificationPermission();
    const startSeconds = secondsLeft > 0 ? secondsLeft : minutes * 60;
    setSecondsLeft(startSeconds);
    setRunning(true);
    setFinished(false);
    startTimeRef.current = Date.now();

    savePomodoroState({
      running: true,
      secondsLeft: startSeconds,
      startTime: startTimeRef.current,
      totalSeconds: minutes * 60,
    });

    startTimer(startSeconds);
  };
  const handlePause = () => {
    setRunning(false);
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "pause" } as PomodoroWorkerMessage);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    savePomodoroState({
      running: false,
      secondsLeft,
      startTime: startTimeRef.current,
      totalSeconds: minutes * 60,
    });
  };
  const handleReset = () => {
    setRunning(false);
    setFinished(false);
    setSecondsLeft(minutes * 60);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "reset",
        seconds: minutes * 60,
      } as PomodoroWorkerMessage);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearPomodoroState();
  };

  // 进度计算
  const totalSeconds = minutes * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // 圆环 SVG 参数
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest flex flex-wrap items-center gap-1">
          🍅 番茄专注森林
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
        <p className="text-forest-bark mt-1 text-sm">专注完成任务,收获星愿币奖励</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧:任务选择 */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-display text-lg text-forest-deep">选择任务</h2>
          {/* 自由专注选项卡:取消任务选择,允许自定义时长 */}
          <div
            onClick={() => {
              setSelectedTaskId(null);
              setSearchParams({});
              setRunning(false);
              setFinished(false);
            }}
            className={clsx(
              "w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer",
              selectedTaskId === null
                ? "border-forest-mid bg-forest-mid/15"
                : "border-transparent glass"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center border-forest-light/60 bg-white/40 text-sm">
                🌿
              </div>
              <span
                className={clsx(
                  "font-medium text-sm flex-1",
                  selectedTaskId === null ? "text-forest-deep" : "text-forest-bark"
                )}
              >
                自由专注
              </span>
            </div>
            <div className="text-xs text-forest-bark mt-1 ml-9">
              不选任务,自定义时长
            </div>
          </div>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {todayTasks.length === 0 ? (
              <div className="glass-card p-6 text-center text-sm text-forest-bark">
                <div className="text-3xl mb-2">🌿</div>
                今天还没有任务
                <br />
                去任务清单创建吧
              </div>
            ) : (
              <>
                {uncompletedTasks.length === 0 && !showCompleted ? (
                  <div className="glass-card p-6 text-center text-sm text-forest-bark">
                    <div className="text-3xl mb-2">🎉</div>
                    今天的任务都完成了!
                  </div>
                ) : (
                  uncompletedTasks.map((t) => {
                    const done = isTaskCompletedOnDate(t, todayISO());
                    const active = t.id === selectedTaskId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTask(t.id)}
                        className={clsx(
                          "w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer",
                          active
                            ? "border-forest-mid bg-forest-mid/15"
                            : "border-transparent glass"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (done) {
                                uncompleteTask(t.id, todayISO());
                              } else {
                                completeTask(t.id, todayISO());
                              }
                            }}
                            className={clsx(
                              "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                              done
                                ? "bg-forest-mid border-forest-mid text-white"
                                : "border-forest-light/60 hover:border-forest-mid bg-white/40"
                            )}
                          >
                            {done && <Check size={16} strokeWidth={3} />}
                          </button>
                          <span
                            className={clsx(
                              "font-medium text-sm flex-1",
                              done && "text-strike text-forest-bark"
                            )}
                          >
                            {t.name}
                          </span>
                          <StarCoinBadge amount={t.starCoins} size="sm" />
                        </div>
                        <div className="text-xs text-forest-bark mt-1 ml-9">
                          🍅 {t.pomodoroMinutes}分钟 · {t.startTime}-{t.endTime}
                        </div>
                      </div>
                    );
                  })
                )}

                {completedTasks.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="w-full py-2 text-sm text-forest-bark hover:text-forest-deep transition-colors flex items-center justify-center gap-2"
                    >
                      {showCompleted ? "▼" : "▲"}
                      {showCompleted ? "隐藏已完成任务" : `显示 ${completedTasks.length} 个已完成任务`}
                    </button>

                    <div
                      className={clsx(
                        "overflow-hidden transition-all duration-300",
                        showCompleted ? "max-h-[1000px]" : "max-h-0"
                      )}
                    >
                      <div className="space-y-2 pt-2">
                        {completedTasks.map((t) => {
                          const done = isTaskCompletedOnDate(t, todayISO());
                          const active = t.id === selectedTaskId;
                          return (
                            <div
                              key={t.id}
                              onClick={() => handleSelectTask(t.id)}
                              className={clsx(
                                "w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer opacity-60",
                                active
                                  ? "border-forest-mid bg-forest-mid/15"
                                  : "border-transparent glass"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (done) {
                                      uncompleteTask(t.id, todayISO());
                                    } else {
                                      completeTask(t.id, todayISO());
                                    }
                                  }}
                                  className={clsx(
                                    "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                                    done
                                      ? "bg-forest-mid border-forest-mid text-white"
                                      : "border-forest-light/60 hover:border-forest-mid bg-white/40"
                                  )}
                                >
                                  {done && <Check size={16} strokeWidth={3} />}
                                </button>
                                <span
                                  className={clsx(
                                    "font-medium text-sm flex-1 text-strike text-forest-bark"
                                  )}
                                >
                                  {t.name}
                                </span>
                                <StarCoinBadge amount={t.starCoins} size="sm" />
                              </div>
                              <div className="text-xs text-forest-bark mt-1 ml-9">
                                🍅 {t.pomodoroMinutes}分钟 · {t.startTime}-{t.endTime}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* 右侧:计时器 */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 md:p-10 flex flex-col items-center">
            {/* 关联任务名 */}
            {selectedTask ? (
              <div className="text-center mb-4">
                <div className="text-xs text-forest-bark mb-1">正在专注</div>
                <div
                  className={clsx(
                    "font-display text-xl text-forest-deep",
                    taskCompleted && "text-strike"
                  )}
                >
                  {taskCompleted ? "✅ " : "🍅 "}
                  {selectedTask.name}
                </div>
                {taskCompleted && (
                  <div className="text-xs text-forest-mid mt-1">任务已完成,星愿币已发放</div>
                )}
              </div>
            ) : (
              <div className="text-center mb-4">
                <div className="text-xs text-forest-bark mb-1">自由模式</div>
                <div className="font-display text-xl text-forest-deep">
                  🌿 自由专注
                </div>
                <div className="text-xs text-forest-bark mt-1">
                  下方设定时长,即可开始专注
                </div>
              </div>
            )}

            {/* 计时圆环 */}
            <div className="relative w-[300px] h-[300px] my-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
                {/* 背景圆 */}
                <circle
                  cx="150"
                  cy="150"
                  r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="14"
                />
                {/* 进度圆 */}
                <circle
                  cx="150"
                  cy="150"
                  r={R}
                  fill="none"
                  stroke="url(#pomGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                  className="transition-all duration-1000 ease-linear"
                  style={{
                    filter: running
                      ? "drop-shadow(0 0 12px rgba(231,111,81,0.6))"
                      : "drop-shadow(0 0 4px rgba(45,95,63,0.3))",
                  }}
                />
                <defs>
                  <linearGradient id="pomGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E76F51" />
                    <stop offset="100%" stopColor="#F4A261" />
                  </linearGradient>
                </defs>
              </svg>
              {/* 中心数字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={clsx(
                    "font-display text-6xl text-forest-deep tabular-nums",
                    running && "animate-breathe"
                  )}
                >
                  {mm}:{ss}
                </div>
                <div className="text-sm text-forest-bark mt-2">
                  {running ? "专注中..." : finished ? "完成!" : "准备开始"}
                </div>
              </div>

              {/* 星愿币掉落动画 */}
              {coinAnim && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="absolute text-3xl animate-coin-drop"
                      style={{
                        left: `${50 + (i - 2) * 12}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 时长选择 */}
            <div className="grid grid-cols-5 gap-2 w-full max-w-md mb-5">
              {POMODORO_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMinutes(m);
                    setCustomMinutes(m);
                  }}
                  disabled={running}
                  className={clsx(
                    "py-2 rounded-xl border-2 transition-all font-bold text-sm disabled:opacity-50",
                    minutes === m
                      ? "border-berry-red bg-berry-red/15 text-berry-red"
                      : "border-transparent bg-white/30 text-forest-bark"
                  )}
                >
                  {m}分
                </button>
              ))}
              <div className="flex items-center">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={customMinutes}
                  disabled={running}
                  onChange={(e) => {
                    const v = Math.max(1, Number(e.target.value) || 1);
                    setCustomMinutes(v);
                    if (!POMODORO_PRESETS.includes(v)) setMinutes(v);
                  }}
                  className="w-full px-2 py-2 rounded-xl bg-white/40 border border-white/60 text-center text-sm focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-3">
              {!running ? (
                <button
                  onClick={handleStart}
                  disabled={!finished && secondsLeft === 0}
                  className="btn-primary dew-hover flex items-center gap-2 px-8"
                >
                  <Play size={20} />
                  {finished ? "再来一轮" : "开始专注"}
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="btn-gold flex items-center gap-2 px-8"
                >
                  <Pause size={20} />
                  暂停
                </button>
              )}
              <button
                onClick={handleReset}
                className="glass-btn flex items-center gap-2 px-6"
              >
                <RotateCcw size={18} />
                重置
              </button>
            </div>

            {/* 完成奖励提示 */}
            {finished && selectedTask && (
              <div className="mt-5 glass-card p-4 w-full max-w-md text-center animate-slide-up border-2 border-sun-gold/50">
                <div className="text-2xl mb-1">🎉</div>
                <div className="font-display text-lg text-forest-deep">专注完成!</div>
                <div className="flex items-center justify-center gap-2 mt-2 text-forest-mid">
                  <Check size={16} />
                  <span>任务已标记完成</span>
                  <Coins size={16} className="text-sun-gold" />
                  <span className="font-bold">+{selectedTask.starCoins} 星愿币</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
