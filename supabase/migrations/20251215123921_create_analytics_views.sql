/*
  ============================================================
  FIX: Analytics Views for Business Intelligence (PostgreSQL)
  ============================================================

  ✔ Drops existing views to allow type changes
  ✔ Uses BIGINT for COUNT() (PostgreSQL standard)
  ✔ Optimized with FILTER syntax
  ✔ Safe for Supabase migrations
*/

-------------------------------------------------------------
-- DROP EXISTING VIEWS (REQUIRED FOR TYPE CHANGES)
-------------------------------------------------------------
DROP VIEW IF EXISTS contract_metrics_summary CASCADE;
DROP VIEW IF EXISTS contracts_by_month CASCADE;
DROP VIEW IF EXISTS contracts_by_status CASCADE;
DROP VIEW IF EXISTS supplier_performance CASCADE;
DROP VIEW IF EXISTS issue_analytics CASCADE;
DROP VIEW IF EXISTS activity_by_week CASCADE;

-------------------------------------------------------------
-- 1. Overall Contract Metrics Summary
-------------------------------------------------------------
CREATE VIEW contract_metrics_summary AS
SELECT
  COUNT(*) AS total_contracts,
  COALESCE(SUM(total_quantity), 0) AS total_items_shipped,
  ROUND(AVG(total_weight_kg)::numeric, 2) AS avg_weight_per_contract,
  ROUND(AVG(items_per_box)::numeric, 1) AS avg_items_per_box,
  COALESCE(SUM(total_weight_kg), 0) AS total_weight_shipped,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_contracts,
  COUNT(*) FILTER (WHERE status IN ('preparing', 'shipped')) AS active_contracts,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_contracts,
  ROUND(AVG(progress)::numeric, 1) AS avg_progress_percentage
FROM contracts;

-------------------------------------------------------------
-- 2. Monthly Contract Trends
-------------------------------------------------------------
CREATE VIEW contracts_by_month AS
SELECT
  DATE_TRUNC('month', created_at)::date AS month,
  TO_CHAR(created_at, 'Mon YYYY') AS month_label,
  COUNT(*) AS contract_count,
  COALESCE(SUM(total_quantity), 0) AS total_items,
  ROUND(COALESCE(SUM(total_weight_kg), 0)::numeric, 2) AS total_weight,
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_count
FROM contracts
GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon YYYY')
ORDER BY month DESC;

-------------------------------------------------------------
-- 3. Status Distribution
-------------------------------------------------------------
CREATE VIEW contracts_by_status AS
SELECT
  status,
  COUNT(*) AS contract_count,
  ROUND(
    COUNT(*)::numeric
    / NULLIF((SELECT COUNT(*) FROM contracts), 0)
    * 100,
    1
  ) AS percentage,
  COALESCE(SUM(total_quantity), 0) AS total_items,
  ROUND(AVG(progress)::numeric, 1) AS avg_progress
FROM contracts
GROUP BY status
ORDER BY contract_count DESC;

-------------------------------------------------------------
-- 4. Supplier Performance Metrics
-------------------------------------------------------------
CREATE VIEW supplier_performance AS
SELECT
  c.supplier_id,
  u.email AS supplier_email,
  COUNT(c.id) AS total_contracts,
  COALESCE(SUM(c.total_quantity), 0) AS total_items,
  ROUND(AVG(c.progress)::numeric, 1) AS avg_progress,
  COUNT(*) FILTER (WHERE c.status = 'delivered') AS completed_contracts,
  COUNT(*) FILTER (WHERE c.status = 'cancelled') AS cancelled_contracts,
  ROUND(
    COUNT(*) FILTER (WHERE c.status = 'delivered')::numeric
    / NULLIF(COUNT(c.id), 0)
    * 100,
    1
  ) AS completion_rate
FROM contracts c
LEFT JOIN auth.users u ON u.id = c.supplier_id
GROUP BY c.supplier_id, u.email
ORDER BY total_contracts DESC;

-------------------------------------------------------------
-- 5. Issue Analytics
-------------------------------------------------------------
CREATE VIEW issue_analytics AS
SELECT
  COUNT(*) AS total_issues,
  COUNT(*) FILTER (WHERE resolved) AS resolved_issues,
  COUNT(*) FILTER (WHERE NOT resolved) AS open_issues,
  COUNT(*) FILTER (WHERE severity = 'critical') AS critical_issues,
  COUNT(*) FILTER (WHERE severity = 'major') AS major_issues,
  COUNT(*) FILTER (WHERE severity = 'minor') AS minor_issues,
  ROUND(
    COUNT(*) FILTER (WHERE resolved)::numeric
    / NULLIF(COUNT(*), 0)
    * 100,
    1
  ) AS resolution_rate
FROM contract_issues;

-------------------------------------------------------------
-- 6. Weekly Activity Trends
-------------------------------------------------------------
CREATE VIEW activity_by_week AS
SELECT
  DATE_TRUNC('week', created_at)::date AS week_start,
  TO_CHAR(created_at, 'Mon DD') AS week_label,
  COUNT(*) AS activity_count,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(DISTINCT contract_id) AS affected_contracts
FROM activity_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at), TO_CHAR(created_at, 'Mon DD')
ORDER BY week_start DESC;

-------------------------------------------------------------
-- GRANT READ ACCESS
-------------------------------------------------------------
GRANT SELECT ON contract_metrics_summary TO authenticated;
GRANT SELECT ON contracts_by_month TO authenticated;
GRANT SELECT ON contracts_by_status TO authenticated;
GRANT SELECT ON supplier_performance TO authenticated;
GRANT SELECT ON issue_analytics TO authenticated;
GRANT SELECT ON activity_by_week TO authenticated;
