# Analytics SQL Guide - Business Metrics Explained

## Introduction
This guide explains the SQL views powering the analytics dashboard, the business logic behind each metric, and how to interpret the data for decision-making.

## Core Business Metrics

### 1. Contract Metrics Summary

**Business Question**: What's the overall health of our supply chain?

**SQL View**: `contract_metrics_summary`

```sql
SELECT
  COUNT(*)::integer AS total_contracts,
  COALESCE(SUM(total_quantity), 0)::integer AS total_items_shipped,
  COALESCE(ROUND(AVG(total_weight_kg)::numeric, 2), 0) AS avg_weight_per_contract,
  COALESCE(ROUND(AVG(items_per_box)::numeric, 1), 0) AS avg_items_per_box,
  COALESCE(SUM(total_weight_kg), 0)::numeric AS total_weight_shipped,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END)::integer AS delivered_contracts,
  COUNT(CASE WHEN status IN ('preparing', 'shipped') THEN 1 END)::integer AS active_contracts,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::integer AS cancelled_contracts,
  COALESCE(ROUND(AVG(progress)::numeric, 1), 0) AS avg_progress_percentage
FROM contracts;
```

**Key Metrics Explained**:
- **Total Contracts**: Volume indicator - growth shows business expansion
- **Total Items Shipped**: Scale metric - tracks actual goods movement
- **Avg Weight**: Operational planning - shipping cost estimation
- **Delivered Contracts**: Success metric - measures completion rate
- **Active Contracts**: Pipeline health - work in progress
- **Avg Progress**: Velocity indicator - how fast contracts move through pipeline

**Decision Support**:
- High active vs delivered ratio = potential bottleneck
- Low average progress = process efficiency issue
- High cancellation rate = quality or planning problem

---

### 2. Monthly Contract Trends

**Business Question**: Is our business growing or declining?

**SQL View**: `contracts_by_month`

```sql
SELECT
  DATE_TRUNC('month', created_at)::date AS month,
  TO_CHAR(created_at, 'Mon YYYY') AS month_label,
  COUNT(*)::integer AS contract_count,
  COALESCE(SUM(total_quantity), 0)::integer AS total_items,
  COALESCE(ROUND(SUM(total_weight_kg)::numeric, 2), 0) AS total_weight,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END)::integer AS delivered_count
FROM contracts
GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon YYYY')
ORDER BY DATE_TRUNC('month', created_at) DESC;
```

**Key Metrics Explained**:
- **Contract Count**: New business volume per month
- **Total Items**: Scale of monthly operations
- **Total Weight**: Shipping capacity requirements
- **Delivered Count**: Monthly completion success

**Business Patterns to Detect**:
- **Seasonal Trends**: Identify peak/slow months
- **Growth Rate**: Month-over-month increase/decrease
- **Capacity Planning**: Match resources to demand
- **Performance Consistency**: Delivery rate stability

**Example Analysis**:
- Dec: 50 contracts, 45 delivered (90% completion)
- Jan: 75 contracts, 60 delivered (80% completion)
- **Insight**: Volume up 50%, but completion rate down 10% - need more resources

---

### 3. Contract Status Distribution

**Business Question**: Where are contracts getting stuck?

**SQL View**: `contracts_by_status`

```sql
SELECT
  status,
  COUNT(*)::integer AS count,
  ROUND((COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM contracts), 0) * 100), 1) AS percentage,
  COALESCE(SUM(total_quantity), 0)::integer AS total_items,
  COALESCE(ROUND(AVG(progress)::numeric, 1), 0) AS avg_progress
FROM contracts
GROUP BY status
ORDER BY count DESC;
```

**Status Meanings**:
- **Draft** (0-10%): Contracts being planned - should be minimal
- **Preparing** (10-30%): Typical - active work starting
- **Shipped** (30-50%): Healthy pipeline - in transit
- **Delivered** (>50%): Success - completed contracts
- **Cancelled** (<10%): Acceptable - failures/changes

**Red Flags**:
- >20% in Draft = Planning bottleneck
- >40% in Preparing = Production issues
- <30% Delivered = Completion problem
- >15% Cancelled = Quality/planning issues

---

### 4. Supplier Performance

**Business Question**: Which suppliers are performing well?

**SQL View**: `supplier_performance`

```sql
SELECT
  c.supplier_id,
  u.email AS supplier_email,
  COUNT(c.id)::integer AS total_contracts,
  COALESCE(SUM(c.total_quantity), 0)::integer AS total_items,
  COALESCE(ROUND(AVG(c.progress)::numeric, 1), 0) AS avg_progress,
  COUNT(CASE WHEN c.status = 'delivered' THEN 1 END)::integer AS completed_contracts,
  COUNT(CASE WHEN c.status = 'cancelled' THEN 1 END)::integer AS cancelled_contracts,
  ROUND((COUNT(CASE WHEN c.status = 'delivered' THEN 1 END)::numeric /
    NULLIF(COUNT(c.id), 0) * 100), 1) AS completion_rate
FROM contracts c
LEFT JOIN auth.users u ON c.supplier_id = u.id
GROUP BY c.supplier_id, u.email
ORDER BY total_contracts DESC;
```

**Performance Indicators**:
- **Completion Rate**: Target >80%
- **Avg Progress**: Should match contract age
- **Cancellation Rate**: Target <10%

**Supplier Tiers**:
- **Platinum**: >90% completion, <5% cancellation
- **Gold**: 80-90% completion, <10% cancellation
- **Silver**: 70-80% completion, <15% cancellation
- **Needs Improvement**: <70% completion or >15% cancellation

---

### 5. Issue Analytics

**Business Question**: How well are we managing quality issues?

**SQL View**: `issue_analytics`

```sql
SELECT
  COUNT(*)::integer AS total_issues,
  COUNT(CASE WHEN resolved THEN 1 END)::integer AS resolved_issues,
  COUNT(CASE WHEN NOT resolved THEN 1 END)::integer AS open_issues,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END)::integer AS critical_issues,
  COUNT(CASE WHEN severity = 'major' THEN 1 END)::integer AS major_issues,
  COUNT(CASE WHEN severity = 'minor' THEN 1 END)::integer AS minor_issues,
  ROUND((COUNT(CASE WHEN resolved THEN 1 END)::numeric /
    NULLIF(COUNT(*), 0) * 100), 1) AS resolution_rate
FROM contract_issues;
```

**Severity Impact**:
- **Critical**: Blocks delivery, immediate action required
- **Major**: Delays possible, resolve within 24-48 hours
- **Minor**: Quality concern, resolve within 1 week

**Resolution Rate Targets**:
- **Excellent**: >80% resolved
- **Good**: 60-80% resolved
- **Needs Improvement**: 40-60% resolved
- **Critical**: <40% resolved

**Quality Indicators**:
- Total issues / total contracts = Issue rate
- Critical issues > 0 = Immediate attention required
- Resolution rate trend = Process improvement

---

### 6. Weekly Activity Trends

**Business Question**: Are users actively engaging with the platform?

**SQL View**: `activity_by_week`

```sql
SELECT
  DATE_TRUNC('week', created_at)::date AS week_start,
  TO_CHAR(created_at, 'Mon DD') AS week_label,
  COUNT(*)::integer AS activity_count,
  COUNT(DISTINCT user_id)::integer AS active_users,
  COUNT(DISTINCT contract_id)::integer AS affected_contracts
FROM activity_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at), TO_CHAR(created_at, 'Mon DD')
ORDER BY DATE_TRUNC('week', created_at) DESC;
```

**Engagement Metrics**:
- **Activity Count**: Total actions taken
- **Active Users**: Unique users engaged
- **Affected Contracts**: Contracts being updated

**Engagement Health**:
- Increasing activity = Good adoption
- Decreasing activity = User friction or completion
- Active users trend = Platform value

---

## Data Cleaning and Quality

### Null Handling
All views use `COALESCE()` to handle null values:
```sql
COALESCE(SUM(total_quantity), 0)  -- Returns 0 if null
```

### Division by Zero Prevention
Using `NULLIF()` prevents division by zero:
```sql
COUNT(*) / NULLIF(total_count, 0)  -- Returns null instead of error
```

### Type Casting
Explicit casting ensures correct data types:
```sql
COUNT(*)::integer              -- Cast to integer
ROUND(value::numeric, 2)       -- Cast to numeric with 2 decimals
```

---

## Performance Optimization

### Why Use Views?
1. **Reusability**: Query once, use everywhere
2. **Consistency**: Same logic across dashboard
3. **Performance**: Pre-aggregated calculations
4. **Security**: RLS applied automatically
5. **Maintenance**: Update logic in one place

### Index Recommendations
```sql
CREATE INDEX idx_contracts_created_at ON contracts(created_at);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX idx_issues_resolved ON contract_issues(resolved);
CREATE INDEX idx_activity_created ON activity_logs(created_at);
```

---

## Extending the Analytics

### Adding New Metrics

**Example: Average Days to Delivery**
```sql
CREATE OR REPLACE VIEW delivery_performance AS
SELECT
  AVG(EXTRACT(DAY FROM (updated_at - created_at)))::numeric AS avg_days_to_delivery,
  MIN(EXTRACT(DAY FROM (updated_at - created_at)))::numeric AS fastest_delivery,
  MAX(EXTRACT(DAY FROM (updated_at - created_at)))::numeric AS slowest_delivery
FROM contracts
WHERE status = 'delivered';
```

**Example: Box Efficiency Analysis**
```sql
CREATE OR REPLACE VIEW box_efficiency AS
SELECT
  box_size,
  COUNT(*)::integer AS usage_count,
  AVG(items_per_box)::numeric AS avg_utilization,
  SUM(total_quantity)::integer AS total_items
FROM contracts
GROUP BY box_size
ORDER BY usage_count DESC;
```

---

## Troubleshooting Common Issues

### View Returns No Data
```sql
-- Check if base table has data
SELECT COUNT(*) FROM contracts;

-- Check RLS policies
SELECT * FROM contracts LIMIT 1;
```

### Incorrect Calculations
```sql
-- Verify aggregation logic
SELECT
  status,
  COUNT(*),
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contracts) as percentage
FROM contracts
GROUP BY status;
```

### Performance Problems
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM contract_metrics_summary;

-- Check for missing indexes
SELECT * FROM pg_indexes WHERE tablename = 'contracts';
```

---

## Best Practices

1. **Always use COALESCE** for nullable columns
2. **Cast types explicitly** to avoid surprises
3. **Use CASE WHEN** for conditional counting
4. **Group by the same fields** in SELECT
5. **Order results** for consistent display
6. **Document business logic** in comments
7. **Test with empty tables** to verify null handling
8. **Validate calculations** against raw data

---

**Remember**: Analytics are only valuable if they drive action. Each metric should answer a business question and lead to a decision.
