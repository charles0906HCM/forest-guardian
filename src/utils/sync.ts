import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { AppData } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

const SYNC_CODE_KEY = "forest-guard-sync-code";
const SYNC_LATEST_TS_KEY = "forest-guard-sync-latest-ts";

export type SyncStatus = "idle" | "syncing" | "error" | "connected";

// 生成6位同步码
export function generateSyncCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 获取本地保存的同步码
export function getLocalSyncCode(): string | null {
  return localStorage.getItem(SYNC_CODE_KEY);
}

// 保存同步码到本地
export function setLocalSyncCode(code: string): void {
  localStorage.setItem(SYNC_CODE_KEY, code);
}

// 清除本地同步码
export function clearLocalSyncCode(): void {
  localStorage.removeItem(SYNC_CODE_KEY);
  localStorage.removeItem(SYNC_LATEST_TS_KEY);
}

// 获取本地最新同步时间
export function getLocalSyncTs(): string {
  return localStorage.getItem(SYNC_LATEST_TS_KEY) || "";
}

// 更新本地同步时间
function setLocalSyncTs(ts: string): void {
  localStorage.setItem(SYNC_LATEST_TS_KEY, ts);
}

// 上传数据到云端
export async function pushData(data: AppData, code: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const now = new Date().toISOString();
  const payload = {
    code,
    data: JSON.stringify(data),
    updated_at: now,
  };

  const { error } = await sb
    .from("sync_rooms")
    .upsert(payload, { onConflict: "code" });

  if (!error) {
    setLocalSyncTs(now);
  }
  return !error;
}

// 从云端拉取数据
export async function pullData(code: string): Promise<{ data: AppData | null; ts: string }> {
  const sb = getSupabase();
  if (!sb) return { data: null, ts: "" };

  const { data: row, error } = await sb
    .from("sync_rooms")
    .select("data, updated_at")
    .eq("code", code)
    .single();

  if (error || !row) return { data: null, ts: "" };

  try {
    const parsed = JSON.parse(row.data) as AppData;
    setLocalSyncTs(row.updated_at);
    return { data: parsed, ts: row.updated_at };
  } catch {
    return { data: null, ts: "" };
  }
}

// 检查同步码是否存在
export async function checkSyncCode(code: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const { data, error } = await sb
    .from("sync_rooms")
    .select("code")
    .eq("code", code)
    .single();

  return !error && !!data;
}

// 实时监听云端数据变化
let channel: RealtimeChannel | null = null;

export function subscribeSync(
  code: string,
  onRemoteChange: (data: AppData) => void
): boolean {
  const sb = getSupabase();
  if (!sb) return false;

  unsubscribeSync();

  channel = sb
    .channel(`sync-room-${code}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sync_rooms",
        filter: `code=eq.${code}`,
      },
      (payload) => {
        try {
          const newData = JSON.parse(payload.new.data) as AppData;
          const remoteTs = payload.new.updated_at as string;
          const localTs = getLocalSyncTs();
          if (remoteTs > localTs) {
            setLocalSyncTs(remoteTs);
            onRemoteChange(newData);
          }
        } catch {
          // 忽略解析错误
        }
      }
    )
    .subscribe();

  return true;
}

export function unsubscribeSync(): void {
  if (channel) {
    const sb = getSupabase();
    if (sb) {
      sb.removeChannel(channel);
    }
    channel = null;
  }
}

// 判断是否可用云同步
export function canSync(): boolean {
  return isSupabaseConfigured();
}
