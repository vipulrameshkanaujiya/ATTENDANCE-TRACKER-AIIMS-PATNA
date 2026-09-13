-- 20260913000003_schedule_index.sql
-- Composite index for ultra-fast schedule filtering by date and batch_scope
CREATE INDEX IF NOT EXISTS idx_classes_date_batch ON public.classes(date, batch_scope);
