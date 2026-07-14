import { type ReactNode } from "react";
import { clsx } from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

// 毛玻璃卡片容器
export default function GlassCard({
  children,
  className,
  onClick,
  hover = false,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card p-5",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
