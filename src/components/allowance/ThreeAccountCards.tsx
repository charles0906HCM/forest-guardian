import { useAppStore } from "@/store/useAppStore";
import type { AccountType } from "@/types";

interface ThreeAccountCardsProps {
  onCardClick?: (account: AccountType) => void;
}

const ACCOUNT_CONFIG: Record<
  AccountType,
  { name: string; color: string; icon: string; balanceKey: string }
> = {
  consume: {
    name: "消费金",
    color: "#4361EE",
    icon: "💰",
    balanceKey: "consumeBalance",
  },
  save: {
    name: "储蓄金",
    color: "#FFB703",
    icon: "🏦",
    balanceKey: "saveBalance",
  },
  share: {
    name: "分享金",
    color: "#FF70A6",
    icon: "🎁",
    balanceKey: "shareBalance",
  },
};

export default function ThreeAccountCards({ onCardClick }: ThreeAccountCardsProps) {
  const wallet = useAppStore((s) => s.wallet);

  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.keys(ACCOUNT_CONFIG) as AccountType[]).map((key) => {
        const cfg = ACCOUNT_CONFIG[key];
        const balance = wallet[cfg.balanceKey as keyof typeof wallet] as number;

        return (
          <button
            key={key}
            onClick={() => onCardClick?.(key)}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 text-center group"
          >
            {/* 图标 */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${cfg.color}20` }}
            >
              {cfg.icon}
            </div>

            {/* 名称 */}
            <span
              className="text-xs font-medium"
              style={{ color: cfg.color }}
            >
              {cfg.name}
            </span>

            {/* 余额 */}
            <span
              className="font-display text-lg leading-tight"
              style={{ color: cfg.color }}
            >
              ¥{balance.toFixed(2)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
