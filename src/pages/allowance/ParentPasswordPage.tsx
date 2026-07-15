import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

interface ParentPasswordPageProps {
  onVerified: () => void;
  onCancel?: () => void;
}

export default function ParentPasswordPage({ onVerified, onCancel }: ParentPasswordPageProps) {
  const parentPassword = useAppStore((s) => s.allowanceSettings.parentPassword);
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleDigit = useCallback(
    (d: string) => {
      if (digits.length >= 4 || shaking) return;
      const next = [...digits, d];
      setDigits(next);

      if (next.length === 4) {
        const entered = next.join("");
        if (entered === parentPassword) {
          onVerified();
        } else {
          setError(true);
          setShaking(true);
          setTimeout(() => {
            setDigits([]);
            setError(false);
            setShaking(false);
          }, 600);
        }
      }
    },
    [digits, parentPassword, onVerified, shaking]
  );

  const handleDelete = useCallback(() => {
    if (digits.length > 0 && !shaking) {
      setDigits(digits.slice(0, -1));
      setError(false);
    }
  }, [digits, shaking]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="font-display text-2xl text-forest-deep text-shadow-forest mb-2">
        家长验证
      </h2>
      <p className="text-sm text-forest-bark mb-8">请输入4位家长密码</p>

      {/* 密码圆点 */}
      <div
        className={`flex gap-5 mb-8 ${shaking ? "animate-shake" : ""}`}
        style={
          shaking
            ? { animation: "shake 0.5s ease-in-out" }
            : undefined
        }
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              digits[i]
                ? "bg-forest-mid border-forest-mid scale-110"
                : "bg-white/30 border-white/60"
            } ${error ? "border-berry-red bg-berry-red" : ""}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-berry-red text-sm mb-4 animate-fade-in">密码错误，请重试</p>
      )}

      {/* 数字键盘 */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key, i) => {
          if (key === "") return <div key={i} />;
          return (
            <button
              key={i}
              onClick={() => (key === "⌫" ? handleDelete() : handleDigit(key))}
              className={`h-14 rounded-2xl font-display text-xl flex items-center justify-center transition-all duration-200 ${
                key === "⌫"
                  ? "glass-btn text-forest-bark"
                  : "glass-btn text-forest-deep hover:bg-white/70 active:scale-95"
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 text-sm text-forest-bark hover:text-forest-deep transition-colors"
        >
          取消验证
        </button>
      )}

      {/* 抖动动画的内联样式 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
