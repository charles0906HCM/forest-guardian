export interface PomodoroState {
  running: boolean;
  secondsLeft: number;
  startTime: number;
  totalSeconds: number;
}

const STORAGE_KEY = "pomodoro_state";

export function savePomodoroState(state: PomodoroState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable, ignore
  }
}

export function loadPomodoroState(): PomodoroState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const state = JSON.parse(data) as PomodoroState;
    if (
      typeof state.running === "boolean" &&
      typeof state.secondsLeft === "number" &&
      typeof state.startTime === "number" &&
      typeof state.totalSeconds === "number"
    ) {
      return state;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPomodoroState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable, ignore
  }
}