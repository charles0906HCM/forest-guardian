export type PomodoroWorkerMessage =
  | { type: 'start'; seconds: number }
  | { type: 'pause' }
  | { type: 'reset'; seconds: number }
  | { type: 'stop' };

export type PomodoroWorkerResponse =
  | { type: 'tick'; secondsLeft: number }
  | { type: 'finished' };

let intervalId: number | null = null;
let secondsLeft = 0;

function cleanup() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

self.onmessage = (e: MessageEvent<PomodoroWorkerMessage>) => {
  const { type } = e.data;

  switch (type) {
    case 'start': {
      cleanup();
      secondsLeft = e.data.seconds;
      intervalId = self.setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          cleanup();
          self.postMessage({ type: 'finished' } as PomodoroWorkerResponse);
        } else {
          self.postMessage({ type: 'tick', secondsLeft } as PomodoroWorkerResponse);
        }
      }, 1000);
      break;
    }

    case 'pause': {
      cleanup();
      break;
    }

    case 'reset': {
      cleanup();
      secondsLeft = e.data.seconds;
      self.postMessage({ type: 'tick', secondsLeft } as PomodoroWorkerResponse);
      break;
    }

    case 'stop': {
      cleanup();
      break;
    }
  }
};

self.addEventListener('close', cleanup);