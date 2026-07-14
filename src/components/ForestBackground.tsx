import { useMemo } from "react";

// 森林背景:分层渐变 + 远山剪影 + 飘落树叶 + 阳光光晕
export default function ForestBackground() {
  // 预生成树叶粒子
  const leaves = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 8,
        size: 14 + Math.random() * 12,
        emoji: ["🍃", "🌿", "🍂"][i % 3],
        drift: (Math.random() - 0.5) * 120,
      })),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 底层渐变已由 body 提供 */}
      {/* 阳光光晕 */}
      <div
        className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full animate-sun-shimmer"
        style={{
          background:
            "radial-gradient(circle, rgba(255,209,102,0.45) 0%, rgba(255,209,102,0.1) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full animate-sun-shimmer"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 50%, transparent 70%)",
          animationDelay: "2s",
        }}
      />

      {/* 远山剪影 */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "45vh" }}
      >
        <defs>
          <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d7b52" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2d5f3f" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d5f3f" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e3f2a" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        {/* 远山 */}
        <path
          d="M0,200 L120,140 L260,180 L380,100 L520,160 L660,90 L820,150 L960,110 L1120,170 L1280,120 L1440,160 L1440,320 L0,320 Z"
          fill="url(#mountain1)"
        />
        {/* 近山 */}
        <path
          d="M0,260 L180,200 L340,240 L500,180 L680,230 L860,190 L1040,240 L1220,200 L1440,250 L1440,320 L0,320 Z"
          fill="url(#mountain2)"
        />
        {/* 树木剪影 */}
        <g fill="#1e3f2a" opacity="0.85">
          <path d="M120,260 L128,230 L136,260 Z" />
          <path d="M300,255 L310,215 L320,255 Z" />
          <path d="M480,250 L488,222 L496,250 Z" />
          <path d="M700,255 L710,218 L720,255 Z" />
          <path d="M920,253 L930,220 L940,253 Z" />
          <path d="M1150,256 L1160,225 L1170,256 Z" />
          <path d="M1350,252 L1360,220 L1370,252 Z" />
        </g>
      </svg>

      {/* 飘落树叶 */}
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute top-0 animate-leaf-fall"
          style={{
            left: `${leaf.left}%`,
            fontSize: `${leaf.size}px`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            ["--tw-leaf-drift" as string]: `${leaf.drift}px`,
          }}
        >
          {leaf.emoji}
        </div>
      ))}

      {/* 晨雾 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(244,247,245,0.5) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
