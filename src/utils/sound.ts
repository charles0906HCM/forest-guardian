// 使用 Web Audio API 合成完成提示音(三音上升,森林风铃风格)
let audioCtx: AudioContext | null = null;

// 在用户手势(如点击"开始专注")时调用,预热 AudioContext
// 浏览器自动播放策略要求 AudioContext 必须由用户手势创建/resume
export function initAudioContext(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
  } catch {
    // 音频不可用时静默失败
  }
}

export function playFinishSound(): void {
  try {
    if (!audioCtx) {
      // 兜底:若未预热,在此创建(可能被浏览器限制)
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();

    // 三音上升: C5(523.25) -> E5(659.25) -> G5(783.99)
    const notes = [
      { freq: 523.25, start: 0, dur: 0.2 },
      { freq: 659.25, start: 0.15, dur: 0.2 },
      { freq: 783.99, start: 0.3, dur: 0.4 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + note.start);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + note.start + note.dur
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + note.start);
      osc.stop(ctx.currentTime + note.start + note.dur);
    });
  } catch {
    // 音频不可用时静默失败
  }
}
