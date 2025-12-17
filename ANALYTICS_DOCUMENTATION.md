# Data Analytics System Documentation

## Overview
The Data Analytics page provides comprehensive business intelligence and performance metrics for the Supplier Dashboard. It transforms raw contract, issue, and activity data into actionable insights using professional charts, KPIs, and business recommendations.

## Architecture

### Data Layer (SQL Views)
All analytics data is pre-aggregated using PostgreSQL views for optimal performance:

#### `contract_metrics_summary`
Provides overall KPIs across all contracts:
- Total contracts count
- Total items shipped
- Average weight per contract
- Average items per box
- Total weight shipped
- Delivered/Active/Cancelled counts
- Average progress percentage

#### `contracts_by_month`
Monthly trend analysis for the past year:
- Contract count by month
- Total items and weight per month
- Delivered count by month
- Month labels for chart display

#### `contracts_by_status`
Status distribution analysis:
- Count and percentage by status
- Total items per status
- Average progress per status

#### `supplier_performance`
Per-supplier metrics (admin view):
- Total contracts per supplier
- Completion rates
- Average progress
- Cancelled contracts

#### `issue_analytics`
Issue management metrics:
- Total/Open/Resolved issues
- Critical/Major/Minor breakdown
- Resolution rate percentage

#### `activity_by_week`
Weekly activity trends (12 weeks):
- Activity count per week
- Active users count
- Affected contracts count

## Frontend Components

### Data Fetching Hook
**File:** `lib/hooks/useAnalytics.ts`

Fetches all analytics data in parallel for optimal performance:
```typescript
const {
  summary,
  monthlyTrends,
  statusDistribution,
  issueMetrics,
  weeklyActivity,
  loading,
  error,
  refetch
} = useAnalytics();
```

### Chart Components

#### 1. MonthlyTrendChart
**File:** `components/charts/MonthlyTrendChart.tsx`

Features:
- Line or Bar chart toggle
- Shows contract volume and delivery trends
- Automatic trend analysis and insights
- Custom tooltips with detailed metrics
- Responsive design

**Business Insights Generated:**
- Month-over-month growth/decline percentages
- Trend direction indicators

#### 2. StatusDistributionChart
**File:** `components/charts/StatusDistributionChart.tsx`

Features:
- Pie chart visualization
- Color-coded by status
- Percentage labels on segments
- Detailed tooltip with item counts
- Status summary grid

**Business Insights Generated:**
- Delivery performance assessment
- Cancellation rate warnings
- Pipeline health indicators

#### 3. WeeklyActivityChart
**File:** `components/charts/WeeklyActivityChart.tsx`

Features:
- Bar chart showing 12-week history
- Activity count tracking
- User engagement metrics
- Trend analysis

**Business Insights Generated:**
- Week-over-week engagement changes
- Activity pattern detection

#### 4. IssueMetricsCard
**File:** `components/charts/IssueMetricsCard.tsx`

Features:
- Overall issue metrics display
- Resolution rate with status indicator
- Severity breakdown with progress bars
- Color-coded by urgency
- Actionable recommendations

**Business Insights Generated:**
- Critical issue alerts
- Resolution performance status
- Quality improvement recommendations

### Insight Generation

#### InsightCard Component
**File:** `components/InsightCard.tsx`

Displays AI-style business insights with:
- Color-coded severity (success/warning/info/danger)
- Icon indicators
- Clear title and description
- Animated appearance

#### Automatic Insight Logic
The analytics page automatically generates insights based on:

1. **Active Contract Volume**
   - Triggers when active > delivered
   - Recommends monitoring progress

2. **Delivery Performance**
   - Success: ≥70% completion rate
   - Warning: <40% completion rate
   - Provides operational recommendations

3. **Cancellation Rate**
   - Alert: >15% cancellation rate
   - Suggests root cause investigation

4. **Open Issues**
   - Warning when open issues exist
   - Prioritizes critical issues

## Page Structure

**File:** `app/analytics/page.tsx`

Layout:
1. Header with page title
2. Top KPI cards (4 metrics)
3. Business Insights section (dynamic)
4. Performance Trends chart (with toggle)
5. Two-column grid:
   - Status Distribution pie chart
   - Issue Metrics card
6. Weekly Activity trend chart

## Key Metrics Explained

### Operational Metrics
- **Total Contracts**: All contracts in the system
- **Items Shipped**: Sum of all contract quantities
- **Active Contracts**: Contracts in 'preparing' or 'shipped' status
- **Avg Progress**: Mean progress across all contracts

### Performance Indicators
- **Completion Rate**: (Delivered / Total) × 100
- **Cancellation Rate**: (Cancelled / Total) × 100
- **Resolution Rate**: (Resolved Issues / Total Issues) × 100

### Trend Metrics
- **Month-over-Month Growth**: ((Current - Previous) / Previous) × 100
- **Week-over-Week Activity**: Engagement trend analysis

## Business Decision Support

### For Suppliers
1. **Monitor active contracts** to ensure timely delivery
2. **Track completion rates** to identify bottlenecks
3. **Review issue metrics** to improve quality
4. **Analyze trends** to plan capacity

### For Admins
1. **Identify underperforming suppliers** via completion rates
2. **Prioritize critical issues** requiring attention
3. **Analyze system-wide trends** for strategic planning
4. **Monitor engagement** to assess platform adoption

## Performance Optimizations

1. **SQL Views**: Pre-aggregated data reduces query complexity
2. **Parallel Fetching**: All data fetched simultaneously
3. **Responsive Charts**: Recharts with optimized rendering
4. **Lazy Loading**: Charts render only when visible
5. **Efficient Re-renders**: React hooks with proper dependencies

## Security

- All views use Row Level Security (RLS)
- Authenticated users only
- Admins see all data
- Suppliers see only their data (when applicable)

## Future Enhancements

Potential additions:
1. Date range filters for custom periods
2. Export to CSV/PDF functionality
3. Comparative analysis (period-over-period)
4. Predictive analytics with trend forecasting
5. Custom report builder
6. Email digest of key metrics
7. Real-time updates via WebSocket
8. Advanced filtering and drill-down capabilities

## Troubleshooting

### No Data Showing
- Ensure contracts exist in the database
- Check RLS policies are correctly configured
- Verify user authentication

### Slow Performance
- Check database indexes on frequently queried columns
- Review SQL view complexity
- Consider adding caching layer

### Chart Rendering Issues
- Verify Recharts is properly installed
- Check responsive container dimensions
- Review browser console for errors

## Technical Stack

- **Database**: PostgreSQL (Supabase)
- **Views**: SQL materialized queries
- **Charts**: Recharts library
- **Animations**: Framer Motion
- **State Management**: React hooks
- **Styling**: Tailwind CSS

## Maintenance

Regular tasks:
1. Monitor SQL view performance
2. Update insight logic as business evolves
3. Add new metrics based on user feedback
4. Optimize chart performance for large datasets
5. Review and update business recommendations

---

**Created**: December 2024
**Last Updated**: December 2024
**Version**: 1.0.0
