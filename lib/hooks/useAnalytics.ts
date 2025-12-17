import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsSummary {
  total_contracts: number;
  total_items_shipped: number;
  avg_weight_per_contract: number;
  avg_items_per_box: number;
  total_weight_shipped: number;
  delivered_contracts: number;
  active_contracts: number;
  cancelled_contracts: number;
  avg_progress_percentage: number;
}

export interface MonthlyTrend {
  month: string;
  month_label: string;
  contract_count: number;
  total_items: number;
  total_weight: number;
  delivered_count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  total_items: number;
  avg_progress: number;
}

export interface IssueMetrics {
  total_issues: number;
  resolved_issues: number;
  open_issues: number;
  critical_issues: number;
  major_issues: number;
  minor_issues: number;
  resolution_rate: number;
}

export interface WeeklyActivity {
  week_start: string;
  week_label: string;
  activity_count: number;
  active_users: number;
  affected_contracts: number;
}

export function useAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [issueMetrics, setIssueMetrics] = useState<IssueMetrics | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [summaryRes, trendsRes, statusRes, issuesRes, activityRes] = await Promise.all([
        supabase.from('contract_metrics_summary').select('*').maybeSingle(),
        supabase.from('contracts_by_month').select('*').limit(12),
        supabase.from('contracts_by_status').select('*'),
        supabase.from('issue_analytics').select('*').maybeSingle(),
        supabase.from('activity_by_week').select('*').limit(12),
      ]);

      if (summaryRes.error) throw summaryRes.error;
      if (trendsRes.error) throw trendsRes.error;
      if (statusRes.error) throw statusRes.error;
      if (issuesRes.error) throw issuesRes.error;
      if (activityRes.error) throw activityRes.error;

      setSummary(summaryRes.data);
      setMonthlyTrends(trendsRes.data || []);
      setStatusDistribution(statusRes.data || []);
      setIssueMetrics(issuesRes.data);
      setWeeklyActivity(activityRes.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    summary,
    monthlyTrends,
    statusDistribution,
    issueMetrics,
    weeklyActivity,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
