-- =============================================
-- 森林小卫士 - Supabase 数据库初始化脚本
-- =============================================
-- 
-- 使用方法：
-- 1. 前往 https://supabase.com 注册免费账号
-- 2. 创建一个新项目
-- 3. 在 SQL Editor 中运行此脚本
-- 4. 在项目设置 > API 中复制 URL 和 anon key
-- 5. 填入 .env 文件的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
--

-- 创建同步房间表
CREATE TABLE IF NOT EXISTS sync_rooms (
  code TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON sync_rooms;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sync_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS（行级安全）
ALTER TABLE sync_rooms ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取和写入（通过同步码访问）
-- 因为同步码本身就是访问凭据，所以允许所有操作
CREATE POLICY "Allow anonymous read" ON sync_rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON sync_rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON sync_rooms
  FOR UPDATE USING (true);

-- 启用 Realtime（实时订阅）
ALTER PUBLICATION supabase_realtime ADD TABLE sync_rooms;

-- 可选：设置数据自动清理（30天未更新的房间自动删除）
-- 取消注释以下代码来启用自动清理
-- CREATE OR REPLACE FUNCTION cleanup_old_rooms()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM sync_rooms WHERE updated_at < NOW() - INTERVAL '30 days';
-- END;
-- $$ LANGUAGE plpgsql;
