import { clsx } from "clsx";

interface StarCoinBadgeProps {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// 星愿币徽章
export default function StarCoinBadge({
  amount,
  className,
  size = "md",
}: StarCoinBadgeProps) {
  const sizeClass = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1",
    lg: "px-4 py-2 text-base gap-1.5",
  }[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-bold",
        "bg-gradient-to-r from-sun-light/90 to-sun-gold/90 text-forest-deep",
        "border border-white/60 shadow-sm",
        sizeClass,
        className
      )}
    >
      <span>⭐</span>
      <span>{amount}</span>
    </span>
  );
}
