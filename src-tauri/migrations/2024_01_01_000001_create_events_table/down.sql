-- 删除索引
DROP INDEX IF EXISTS idx_events_start_date;
DROP INDEX IF EXISTS idx_events_end_date;
DROP INDEX IF EXISTS idx_events_date_range;
DROP INDEX IF EXISTS idx_events_created_at;
DROP INDEX IF EXISTS idx_events_is_deleted;
DROP INDEX IF EXISTS idx_events_title;
DROP INDEX IF EXISTS idx_events_description;

-- 删除事件表
DROP TABLE IF EXISTS events; 