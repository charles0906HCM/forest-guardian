import { useState } from "react";
import { Shield, Lock, Repeat, DollarSign, CalendarDays, ToggleLeft, PieChart, Bell, Wallet } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import ParentPasswordPage from "./ParentPasswordPage";

export default function ParentSettingsPage() {
  const settings = useAppStore((s) => s.allowanceSettings);
  const updateAllowanceSettings = useAppStore((s) => s.updateAllowanceSettings);

  const [verified, setVerified] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 密码修改状态
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 固定零用钱设置
  const [weeklyAllowance, setWeeklyAllowance] = useState(0);
  const [monthlyAllowance, setMonthlyAllowance] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  if (!verified) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
            👨‍👩‍👧 家长设置
          </h1>
          <p className="text-forest-bark mt-1 text-sm">修改零用钱与兑换规则</p>
        </header>
        <ParentPasswordPage onVerified={() => setVerified(true)} />
      </div>
    );
  }

  const handleRatioChange = (key: "consumeRatio" | "saveRatio" | "shareRatio", value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    const current = { consumeRatio: settings.consumeRatio, saveRatio: settings.saveRatio, shareRatio: settings.shareRatio };
    current[key] = clamped;
    // 自动归一化
    const total = current.consumeRatio + current.saveRatio + current.shareRatio;
    if (total > 0) {
      current.consumeRatio = Math.round((current.consumeRatio / total) * 100) / 100;
      current.saveRatio = Math.round((current.saveRatio / total) * 100) / 100;
      current.shareRatio = 1 - current.consumeRatio - current.saveRatio;
    }
    updateAllowanceSettings(current);
  };

  const handlePasswordChange = () => {
    if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) {
      showToast("密码必须为4位数字");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("两次输入不一致");
      return;
    }
    updateAllowanceSettings({ parentPassword: newPassword });
    setChangingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
    showToast("密码修改成功");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
          👨‍👩‍👧 家长设置
        </h1>
        <p className="text-forest-bark mt-1 text-sm">修改零用钱与兑换规则</p>
      </header>

      {/* 兑换汇率设置 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Repeat size={20} className="text-forest-mid" />
          星愿币兑换设置
        </h2>
        <div className="space-y-4">
          {/* 兑换汇率 */}
          <div>
            <label className="text-sm text-forest-bark mb-1 block">
              兑换汇率（星愿币 = 1元）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={settings.exchangeRate}
                onChange={(e) => updateAllowanceSettings({ exchangeRate: Math.max(1, Number(e.target.value)) })}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium text-center"
              />
              <span className="text-sm text-forest-bark">星愿币 = 1元</span>
            </div>
          </div>

          {/* 单次兑换上限 */}
          <div>
            <label className="text-sm text-forest-bark mb-1 block">单次兑换上限（元）</label>
            <input
              type="number"
              min={1}
              value={settings.singleExchangeLimit}
              onChange={(e) => updateAllowanceSettings({ singleExchangeLimit: Math.max(1, Number(e.target.value)) })}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
            />
          </div>

          {/* 每日兑换次数上限 */}
          <div>
            <label className="text-sm text-forest-bark mb-1 block">每日兑换次数上限</label>
            <input
              type="number"
              min={1}
              value={settings.dailyExchangeLimit}
              onChange={(e) => updateAllowanceSettings({ dailyExchangeLimit: Math.max(1, Math.round(Number(e.target.value))) })}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
            />
          </div>

          {/* 每周兑换总金额上限 */}
          <div>
            <label className="text-sm text-forest-bark mb-1 block">每周兑换总金额上限（元）</label>
            <input
              type="number"
              min={1}
              value={settings.weeklyExchangeLimit}
              onChange={(e) => updateAllowanceSettings({ weeklyExchangeLimit: Math.max(1, Number(e.target.value)) })}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
            />
          </div>

          {/* 兑换审核开关 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/30">
            <div className="flex items-center gap-2">
              <ToggleLeft size={18} className="text-forest-mid" />
              <span className="text-sm text-forest-deep font-medium">兑换需要审核</span>
            </div>
            <button
              onClick={() => updateAllowanceSettings({ requireReview: !settings.requireReview })}
              className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                settings.requireReview ? "bg-forest-mid" : "bg-white/40"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all duration-300 ${
                  settings.requireReview ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 三金账户分配比例 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <PieChart size={20} className="text-forest-mid" />
          三金账户分配比例
        </h2>
        <p className="text-xs text-forest-bark mb-4">三个比例总和始终为 100%</p>
        <div className="space-y-4">
          {/* 消费金 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: "#4361EE" }}>💰 消费金</span>
              <span className="text-sm font-medium" style={{ color: "#4361EE" }}>{Math.round(settings.consumeRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.consumeRatio * 100)}
              onChange={(e) => handleRatioChange("consumeRatio", Number(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#4361EE" }}
            />
          </div>

          {/* 储蓄金 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: "#FFB703" }}>🏦 储蓄金</span>
              <span className="text-sm font-medium" style={{ color: "#FFB703" }}>{Math.round(settings.saveRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.saveRatio * 100)}
              onChange={(e) => handleRatioChange("saveRatio", Number(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#FFB703" }}
            />
          </div>

          {/* 分享金 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: "#FF70A6" }}>🎁 分享金</span>
              <span className="text-sm font-medium" style={{ color: "#FF70A6" }}>{Math.round(settings.shareRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.shareRatio * 100)}
              onChange={(e) => handleRatioChange("shareRatio", Number(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#FF70A6" }}
            />
          </div>
        </div>
      </section>

      {/* 消费预警阈值 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Bell size={20} className="text-forest-mid" />
          消费预警
        </h2>
        <div>
          <label className="text-sm text-forest-bark mb-1 block">单次消费预警阈值（元）</label>
          <input
            type="number"
            min={0}
            value={settings.alertThreshold}
            onChange={(e) => updateAllowanceSettings({ alertThreshold: Math.max(0, Number(e.target.value)) })}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
          />
          <p className="text-xs text-forest-bark mt-1">超过此金额的消费将标记为预警</p>
        </div>
      </section>

      {/* 固定零用钱 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-forest-mid" />
          固定零用钱
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-forest-bark mb-1 block">每周固定零用钱（元）</label>
            <input
              type="number"
              min={0}
              value={weeklyAllowance}
              onChange={(e) => setWeeklyAllowance(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
            />
          </div>
          <div>
            <label className="text-sm text-forest-bark mb-1 block">每月固定零用钱（元）</label>
            <input
              type="number"
              min={0}
              value={monthlyAllowance}
              onChange={(e) => setMonthlyAllowance(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-medium"
            />
          </div>
        </div>
      </section>

      {/* 家长密码修改 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Lock size={20} className="text-forest-mid" />
          家长密码
        </h2>
        {!changingPassword ? (
          <button
            onClick={() => setChangingPassword(true)}
            className="glass-btn text-forest-deep"
          >
            <Shield size={16} className="inline mr-2" />
            修改密码
          </button>
        ) : (
          <div className="space-y-3 animate-slide-up">
            <div>
              <label className="text-sm text-forest-bark mb-1 block">新密码（4位数字）</label>
              <input
                type="password"
                maxLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-mono text-center tracking-[0.5em]"
                placeholder="····"
              />
            </div>
            <div>
              <label className="text-sm text-forest-bark mb-1 block">确认新密码</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 text-forest-deep font-mono text-center tracking-[0.5em]"
                placeholder="····"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setChangingPassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="flex-1 glass-btn"
              >
                取消
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 btn-primary dew-hover"
              >
                确认修改
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 animate-slide-up max-w-sm text-center">
          <span className="font-medium text-forest-deep">{toast}</span>
        </div>
      )}
    </div>
  );
}
