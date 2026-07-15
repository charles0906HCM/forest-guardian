import { useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { ListChecks, Timer, Coins, ClipboardList, TrendingUp, Settings, Wallet } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const NAV_ITEMS = [
  { path: "/", label: "任务清单", icon: ListChecks, emoji: "📝" },
  { path: "/pomodoro", label: "番茄专注", icon: Timer, emoji: "🍅" },
  { path: "/rewards", label: "星愿币", icon: Coins, emoji: "⭐" },
  { path: "/allowance", label: "零用钱", icon: Wallet, emoji: "💰" },
  { path: "/scores", label: "成绩单", icon: ClipboardList, emoji: "📊" },
  { path: "/analysis", label: "成绩分析", icon: TrendingUp, emoji: "📈" },
];

const SETTINGS_PATH = "/settings";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const balance = useAppStore((s) => s.balance);

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 p-4">
        <div className="glass-card h-full flex flex-col p-5">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-light to-forest-deep flex items-center justify-center text-2xl shadow-glass">
              🌲
            </div>
            <div>
              <h1 className="font-display text-xl text-forest-deep leading-none">星愿森林</h1>
              <p className="text-xs text-forest-bark mt-1">打卡成长乐园</p>
            </div>
          </div>

          {/* 导航项 */}
          <nav className="flex-1 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = item.path === "/" ? location.pathname === "/" : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 dew-hover",
                    active
                      ? "bg-gradient-to-r from-forest-mid to-forest-deep text-white shadow-glass"
                      : "text-forest-deep hover:bg-white/50"
                  )}
                >
                  <Icon size={20} className={active ? "text-white" : "text-forest-mid"} />
                  <span>{item.label}</span>
                  <span className="ml-auto text-lg">{item.emoji}</span>
                </button>
              );
            })}
          </nav>

          {/* 星愿币余额 */}
          <button
            onClick={() => navigate("/rewards")}
            className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-sun-light/80 to-sun-gold/80 border border-white/60 shadow-glass dew-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-forest-deep/70 font-medium">我的星愿币</span>
              <span className="text-lg">⭐</span>
            </div>
            <div className="font-display text-3xl text-forest-deep mt-1">{balance}</div>
          </button>

          {/* 设置按钮 */}
          <button
            onClick={() => navigate(SETTINGS_PATH)}
            className={clsx(
              "mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 dew-hover",
              location.pathname === SETTINGS_PATH
                ? "bg-white/50 text-forest-deep shadow-glass"
                : "text-forest-bark hover:bg-white/50 hover:text-forest-deep"
            )}
          >
            <Settings size={20} className={location.pathname === SETTINGS_PATH ? "text-forest-mid" : ""} />
            <span>设置</span>
            <span className="ml-auto text-lg">⚙️</span>
          </button>
        </div>
      </aside>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3">
        <div className="glass-card flex justify-around p-2">
          {NAV_ITEMS.map((item) => {
            const active = item.path === "/" ? location.pathname === "/" : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all",
                  active ? "text-forest-deep bg-white/50" : "text-forest-bark"
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate(SETTINGS_PATH)}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all",
              location.pathname === SETTINGS_PATH
                ? "text-forest-deep bg-white/50"
                : "text-forest-bark"
            )}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">设置</span>
          </button>
        </div>
      </nav>
    </>
  );
}
