export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return Promise.resolve("denied");
  }
  return Notification.requestPermission();
}

export function sendPomodoroNotification(title: string, body: string, icon?: string): void {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const notificationIcon = icon || "/pwa-192x192.png";

  new Notification(title, {
    body,
    icon: notificationIcon,
    badge: "/pwa-192x192.png",
    requireInteraction: false,
    silent: false,
  });
}

export function updatePomodoroNotification(
  notification: Notification | null,
  title: string,
  body: string
): Notification | null {
  if (!("Notification" in window)) {
    return null;
  }

  if (Notification.permission !== "granted") {
    return null;
  }

  if (notification) {
    notification.close();
  }

  const newNotification = new Notification(title, {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    requireInteraction: false,
    silent: false,
    tag: "pomodoro-tick",
  } as NotificationOptions);

  return newNotification;
}

export function sendPomodoroFinishedNotification(taskName?: string): void {
  const title = "专注完成 🌲";
  const body = taskName
    ? `任务「${taskName}」专注完成！休息一下吧~`
    : "专注完成！休息一下吧~";

  sendPomodoroNotification(title, body);
}

export function sendPomodoroTickNotification(secondsLeft: number, taskName?: string): void {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const title = `专注中 ⏱️ ${timeStr}`;
  const body = taskName ? `正在专注「${taskName}」` : "专注进行中";

  sendPomodoroNotification(title, body);
}