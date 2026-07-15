import { useState } from "react";
import { clsx } from "clsx";
import { Trophy, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { AllowanceAchievement } from "@/types";

// 预设成就定义
const PRESET_ACHIEVEMENTS: Omit<AllowanceAchievement, "id" | "unlocked" | "unlockedAt">[] = [
  { name: "连续记账7天", description: "坚持记账一周", icon: "📝", rewardStarCoins: 5 },
  { name: "连续记账30天", description: "坚持记账一个月", icon: "📊", rewardStarCoins: 20 },
  { name: "本月有结余", description: "月底还有余额", icon: "💰", rewardStarCoins: 10 },
  { name: "完成首个愿望", description: "实现第一个储蓄目标", icon: "🎯", rewardStarCoins: 15 },
  { name: "本月无后悔消费", description: "每次消费都很满意", icon: "😊", rewardStarCoins: 10 },
  { name: "储蓄率超50%", description: "储蓄超过收入一半", icon: "🏦", rewardStarCoins: 10 },
];

// 等级定义
const LEVELS = [
  { name: "理财学徒", minBadges: 0, maxBadges: 1, icon: "🌱" },
  { name: "理财小能手", minBadges: 2, maxBadges: 3, icon: "🌿" },
  { name: "理财小达人", minBadges: 4, maxBadges: 5, icon: "🌳" },
  { name: "理财专家", minBadges: 6, maxBadges: 6, icon: "🏆" },
];

function getLevel(unlockedCount: number) {
  if (unlockedCount >= 6) return LEVELS[3];
  if (unlockedCount >= 4) return LEVELS[2];
  if (unlockedCount >= 2) return LEVELS[1];
  return LEVELS[0];
}

function getNextLevel(unlockedCount: number) {
  if (unlockedCount >= 6) return null;
  if (unlockedCount >= 4) return LEVELS[3];
  if (unlockedCount >= 2) return LEVELS[2];
  return LEVELS[1];
}

export default function AchievementPage() {
  const allowanceAchievements = useAppStore((s) => s.allowanceAchievements);
  const [selectedAchievement, setSelectedAchievement] = useState<AllowanceAchievement | null>(null);

  // 合并预设和实际数据
  const achievements: AllowanceAchievement[] = PRESET_ACHIEVEMENTS.map((preset, index) => {
    const existing = allowanceAchievements.find((a) => a.name === preset.name);
    if (existing) return existing;
    return {
      ...preset,
      id: `preset-achievement-${index}`,
      unlocked: false,
      unlockedAt: null,
    };
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const currentLevel = getLevel(unlockedCount);
  const nextLevel = getNextLevel(unlockedCount);
  const levelProgress = nextLevel
    ? ((unlockedCount - currentLevel.minBadges) / (nextLevel.minBadges - currentLevel.minBadges)) * 100
    : 100;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest flex items-center gap-2">
              <Trophy size={32} className="text-sun-gold" />
              成就徽章
            </h1>
            <p className="text-forest-bark mt-1 text-sm">解锁徽章，提升理财等级</p>
          </div>
        </div>
      </header>

      {/* 等级成长卡片 */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-8xl opacity-20">{currentLevel.icon}</div>
        <div className="relative">
          <div className="text-sm text-forest-bark font-medium">当前等级</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-4xl">{currentLevel.icon}</span>
            <span className="font-display text-3xl text-forest-deep">{currentLevel.name}</span>
          </div>
          {nextLevel ? (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-forest-bark mb-1">
                <span>已解锁 {unlockedCount} 个徽章</span>
                <span>距{nextLevel.name}还需 {nextLevel.minBadges - unlockedCount} 个</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${levelProgress}%`,
                    background: "linear-gradient(90deg, #F4A261, #FFD166)",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="text-xs text-forest-mid font-medium">
                🎉 最高等级！已解锁全部 {unlockedCount} 个徽章
              </div>
              <div className="h-2.5 rounded-full bg-white/40 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #F4A261, #FFD166)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 徽章网格 */}
      <section>
        <h2 className="font-display text-xl text-forest-deep mb-3 flex items-center gap-2">
          🏅 徽章墙
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <button
              key={achievement.id}
              onClick={() => achievement.unlocked && setSelectedAchievement(achievement)}
              className={clsx(
                "glass-card p-4 flex flex-col items-center text-center transition-all",
                achievement.unlocked
                  ? "hover:shadow-glass-lg cursor-pointer"
                  : "opacity-50 cursor-default"
              )}
            >
              <div
                className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2",
                  achievement.unlocked
                    ? "bg-gradient-to-br from-sun-light/60 to-sun-gold/40 shadow-glass"
                    : "bg-white/20 grayscale"
                )}
              >
                {achievement.icon}
              </div>
              <h4
                className={clsx(
                  "font-display text-sm leading-tight",
                  achievement.unlocked ? "text-forest-deep" : "text-forest-bark"
                )}
              >
                {achievement.name}
              </h4>
              <p className="text-[10px] text-forest-bark mt-1 line-clamp-2">
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="mt-2 text-[10px] font-bold text-sun-gold flex items-center gap-0.5">
                  ⭐ +{achievement.rewardStarCoins}
                </div>
              )}
              {!achievement.unlocked && (
                <div className="mt-2 text-[10px] text-forest-bark/60">🔒</div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 等级说明 */}
      <section>
        <h2 className="font-display text-xl text-forest-deep mb-3">📜 等级说明</h2>
        <div className="glass-card p-4">
          <div className="space-y-2">
            {LEVELS.map((level, idx) => (
              <div
                key={idx}
                className={clsx(
                  "flex items-center gap-3 p-2 rounded-xl",
                  currentLevel.name === level.name ? "bg-forest-mid/10" : ""
                )}
              >
                <span className="text-2xl">{level.icon}</span>
                <div className="flex-1">
                  <span className={clsx(
                    "font-display text-sm",
                    currentLevel.name === level.name ? "text-forest-deep font-bold" : "text-forest-bark"
                  )}>
                    {level.name}
                  </span>
                </div>
                <span className="text-xs text-forest-bark">
                  {idx === 3 ? "6个徽章" : `${level.minBadges}-${level.maxBadges}个徽章`}
                </span>
                {currentLevel.name === level.name && (
                  <span className="text-xs font-bold text-forest-mid">← 当前</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 成就详情弹窗 */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}

function AchievementDetailModal({
  achievement,
  onClose,
}: {
  achievement: AllowanceAchievement;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-sm p-6 animate-slide-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
          <X size={18} />
        </button>
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-5xl bg-gradient-to-br from-sun-light/60 to-sun-gold/40 shadow-glass mb-4">
          {achievement.icon}
        </div>
        <h3 className="font-display text-xl text-forest-deep">{achievement.name}</h3>
        <p className="text-sm text-forest-bark mt-1">{achievement.description}</p>
        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sun-gold/20 text-sun-gold text-sm font-bold">
          ⭐ 奖励 {achievement.rewardStarCoins} 星愿币
        </div>
        {achievement.unlockedAt && (
          <div className="mt-4 text-xs text-forest-bark">
            🕐 解锁时间：{new Date(achievement.unlockedAt).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
