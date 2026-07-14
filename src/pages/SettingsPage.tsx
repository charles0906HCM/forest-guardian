import { useState, useRef } from "react";
import { Download, Upload, Settings as SettingsIcon, Smartphone, Cloud, Info, Shield, Link2, Unlink, RefreshCw, Copy, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { canSync } from "@/utils/sync";
import { clsx } from "clsx";

export default function SettingsPage() {
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const tasks = useAppStore((s) => s.tasks);
  const subjects = useAppStore((s) => s.subjects);
  const habits = useAppStore((s) => s.habits);
  const examRecords = useAppStore((s) => s.examRecords);
  const balance = useAppStore((s) => s.balance);

  const syncCode = useAppStore((s) => s.syncCode);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const syncEnabled = useAppStore((s) => s.syncEnabled);
  const createSyncRoom = useAppStore((s) => s.createSyncRoom);
  const joinSyncRoom = useAppStore((s) => s.joinSyncRoom);
  const leaveSyncRoom = useAppStore((s) => s.leaveSyncRoom);
  const syncNow = useAppStore((s) => s.syncNow);

  const [toast, setToast] = useState<string | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, duration = 2000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  const handleExport = async () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const fileName = `森林小卫士_数据备份_${new Date().toISOString().slice(0, 10)}.json`;

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: "application/json" });
      try {
        await navigator.share({
          title: "森林小卫士数据备份",
          text: "森林小卫士数据备份文件，可用于恢复或同步到其他设备",
          files: [file],
        });
        showToast("📤 分享成功！");
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Share failed, fallback to download", err);
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("📤 数据导出成功！可通过隔空投送分享到其他设备");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      try {
        JSON.parse(data);
        setPendingImportData(data);
        setImportConfirmOpen(true);
      } catch {
        showToast("❌ 文件格式错误，请选择正确的备份文件");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!pendingImportData) return;
    const success = importData(pendingImportData);
    if (success) {
      showToast("📥 数据导入成功！", 2500);
    } else {
      showToast("❌ 数据导入失败");
    }
    setImportConfirmOpen(false);
    setPendingImportData(null);
  };

  const cancelImport = () => {
    setImportConfirmOpen(false);
    setPendingImportData(null);
  };

  const handleCreateRoom = async () => {
    setCreateLoading(true);
    const code = await createSyncRoom();
    setCreateLoading(false);
    if (code) {
      showToast(`🎉 同步房间创建成功！同步码：${code}`, 3000);
    } else {
      showToast("❌ 创建同步房间失败，请检查网络连接");
    }
  };

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      showToast("请输入6位同步码");
      return;
    }
    setJoinLoading(true);
    const ok = await joinSyncRoom(code);
    setJoinLoading(false);
    if (ok) {
      showToast("🎉 加入同步房间成功！");
      setJoinCode("");
    } else {
      showToast("❌ 加入失败，请检查同步码是否正确");
    }
  };

  const handleLeaveRoom = () => {
    if (confirm("确定断开云同步吗？断开后数据将仅保存在本地。")) {
      leaveSyncRoom();
      showToast("已断开云同步");
    }
  };

  const handleSyncNow = async () => {
    const ok = await syncNow();
    if (ok) {
      showToast("☁️ 同步成功！");
    } else {
      showToast("❌ 同步失败，请检查网络连接");
    }
  };

  const handleCopyCode = () => {
    if (syncCode) {
      navigator.clipboard.writeText(syncCode).then(() => {
        setCopied(true);
        showToast("📋 同步码已复制");
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        showToast("复制失败，请手动复制");
      });
    }
  };

  const stats = [
    { label: "任务数量", value: tasks.length, icon: "📝" },
    { label: "学科分类", value: subjects.length, icon: "📚" },
    { label: "习惯数量", value: habits.length, icon: "🌟" },
    { label: "考试记录", value: examRecords.length, icon: "📊" },
    { label: "星愿币余额", value: balance, icon: "⭐" },
  ];

  const statusLabel: Record<string, { text: string; color: string }> = {
    idle: { text: "未连接", color: "text-forest-bark" },
    syncing: { text: "同步中…", color: "text-sun-gold" },
    connected: { text: "已连接", color: "text-forest-mid" },
    error: { text: "连接错误", color: "text-berry-red" },
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl text-forest-deep text-shadow-forest">
          ⚙️ 设置
        </h1>
        <p className="text-forest-bark mt-1 text-sm">管理数据与个性化设置</p>
      </header>

      {/* 云同步 */}
      {syncEnabled && (
        <section className="glass-card p-5 md:p-6">
          <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
            <Cloud size={20} className="text-forest-mid" />
            云同步
            {syncCode && (
              <span className={`ml-auto text-xs font-medium ${statusLabel[syncStatus].color}`}>
                ● {statusLabel[syncStatus].text}
              </span>
            )}
          </h2>

          {syncCode ? (
            <div className="space-y-4">
              {/* 已连接状态 */}
              <div className="p-4 rounded-2xl bg-forest-mid/10 border border-forest-mid/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-forest-bark mb-1">同步码</div>
                    <div className="font-mono text-2xl tracking-[0.3em] text-forest-deep font-bold">
                      {syncCode}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="w-10 h-10 rounded-xl bg-white/50 hover:bg-white/80 flex items-center justify-center text-forest-bark hover:text-forest-deep transition-all"
                    title="复制同步码"
                  >
                    {copied ? <Check size={18} className="text-forest-mid" /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-forest-bark mt-2">
                  在其他设备输入此同步码即可自动同步数据
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSyncNow}
                  disabled={syncStatus === "syncing"}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-medium text-sm transition-all",
                    syncStatus === "syncing"
                      ? "bg-white/30 text-forest-bark cursor-not-allowed"
                      : "btn-primary dew-hover"
                  )}
                >
                  <RefreshCw size={16} className={syncStatus === "syncing" ? "animate-spin" : ""} />
                  {syncStatus === "syncing" ? "同步中…" : "立即同步"}
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="glass-btn flex items-center justify-center gap-1.5 px-4 text-berry-red hover:bg-berry-red/10"
                >
                  <Unlink size={16} />
                  断开
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-forest-bark">
                创建或加入同步房间，在电脑、iPhone、iPad 三端实时同步数据。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCreateRoom}
                  disabled={createLoading}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-forest-mid/15 to-forest-light/15 border border-forest-mid/30 hover:from-forest-mid/25 hover:to-forest-light/25 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest-mid/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Cloud size={22} className="text-forest-deep" />
                  </div>
                  <div>
                    <div className="font-medium text-forest-deep">
                      {createLoading ? "创建中…" : "创建同步房间"}
                    </div>
                    <div className="text-xs text-forest-bark mt-0.5">
                      生成同步码，在其他设备输入
                    </div>
                  </div>
                </button>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-sun-gold/15 to-sun-light/15 border border-sun-gold/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-sun-gold/20 flex items-center justify-center">
                      <Link2 size={22} className="text-forest-deep" />
                    </div>
                    <div>
                      <div className="font-medium text-forest-deep">加入同步房间</div>
                      <div className="text-xs text-forest-bark mt-0.5">
                        输入已有同步码
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="输入6位同步码"
                      maxLength={6}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/60 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 font-mono text-center tracking-[0.2em] text-forest-deep"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={joinLoading || joinCode.length !== 6}
                      className={clsx(
                        "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                        joinLoading || joinCode.length !== 6
                          ? "bg-white/30 text-forest-bark cursor-not-allowed"
                          : "btn-primary"
                      )}
                    >
                      {joinLoading ? "…" : "加入"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 手动数据备份 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Download size={20} className="text-forest-mid" />
          数据备份与传输
        </h2>
        <p className="text-sm text-forest-bark mb-4">
          通过导出/导入数据文件，在设备间手动传输数据。
          <br />
          <span className="text-xs">
            💡 iPhone/iPad 上导出后，可通过「隔空投送」发送到其他苹果设备
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-forest-mid/15 to-forest-light/15 border border-forest-mid/30 hover:from-forest-mid/25 hover:to-forest-light/25 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-forest-mid/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download size={22} className="text-forest-deep" />
            </div>
            <div>
              <div className="font-medium text-forest-deep">导出数据</div>
              <div className="text-xs text-forest-bark mt-0.5">
                备份所有数据，支持隔空投送
              </div>
            </div>
          </button>

          <button
            onClick={handleImportClick}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-sun-gold/15 to-sun-light/15 border border-sun-gold/30 hover:from-sun-gold/25 hover:to-sun-light/25 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-sun-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={22} className="text-forest-deep" />
            </div>
            <div>
              <div className="font-medium text-forest-deep">导入数据</div>
              <div className="text-xs text-forest-bark mt-0.5">
                从备份文件恢复数据
              </div>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </section>

      {/* iPhone/iPad 使用说明 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Smartphone size={20} className="text-forest-mid" />
          在 iPhone / iPad 上使用
        </h2>
        <div className="space-y-3 text-sm text-forest-bark">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-forest-mid/20 text-forest-deep flex items-center justify-center flex-shrink-0 text-xs font-bold">
              1
            </span>
            <div>
              <span className="font-medium text-forest-deep">用 Safari 浏览器打开</span>
              <p className="mt-0.5">确保通过 HTTPS 访问</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-forest-mid/20 text-forest-deep flex items-center justify-center flex-shrink-0 text-xs font-bold">
              2
            </span>
            <div>
              <span className="font-medium text-forest-deep">点击分享按钮 → 添加到主屏幕</span>
              <p className="mt-0.5">应用会像普通 App 一样显示在主屏幕上</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-forest-mid/20 text-forest-deep flex items-center justify-center flex-shrink-0 text-xs font-bold">
              3
            </span>
            <div>
              <span className="font-medium text-forest-deep">创建同步房间 → 在其他设备输入同步码</span>
              <p className="mt-0.5">数据自动同步，无需手动导入导出</p>
            </div>
          </div>
        </div>
      </section>

      {/* 数据概览 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <SettingsIcon size={20} className="text-forest-mid" />
          当前数据概览
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-2xl bg-white/40 border border-white/50 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display text-xl text-forest-deep">{s.value}</div>
              <div className="text-xs text-forest-bark">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 关于 */}
      <section className="glass-card p-5 md:p-6">
        <h2 className="font-display text-lg text-forest-deep flex items-center gap-2 mb-4">
          <Info size={20} className="text-forest-mid" />
          关于
        </h2>
        <div className="space-y-2 text-sm text-forest-bark">
          <div className="flex items-center justify-between">
            <span>应用名称</span>
            <span className="font-medium text-forest-deep">森林小卫士</span>
          </div>
          <div className="flex items-center justify-between">
            <span>版本</span>
            <span className="font-medium text-forest-deep">v1.1.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>数据存储</span>
            <span className="font-medium text-forest-deep">
              {syncCode ? "本地 + 云同步" : "本地存储"}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/40">
          <p className="text-xs text-forest-bark text-center">
            🌲 森林小卫士 · 陪伴孩子快乐成长 🌲
          </p>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 animate-slide-up max-w-sm text-center">
          <span className="font-medium text-forest-deep">{toast}</span>
        </div>
      )}

      {importConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
            onClick={cancelImport}
          />
          <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-sun-gold/20 flex items-center justify-center mx-auto mb-3">
                <Shield size={32} className="text-sun-gold" />
              </div>
              <h3 className="font-display text-xl text-forest-deep">确认导入数据？</h3>
              <p className="text-sm text-forest-bark mt-2">
                导入将覆盖当前所有数据，此操作不可撤销。
                <br />
                建议先导出当前数据作为备份。
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={cancelImport} className="flex-1 glass-btn">
                取消
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 btn-primary dew-hover"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
