'use client';

import { motion } from 'framer-motion';
import { IssueMetrics } from '@/lib/hooks/useAnalytics';

interface IssueMetricsCardProps {
  data: IssueMetrics | null;
}

export default function IssueMetricsCard({ data }: IssueMetricsCardProps) {
  if (!data) return null;

  const getSeverityColor = (count: number, total: number) => {
    const percentage = (count / total) * 100;
    if (percentage > 30) return 'text-red-600';
    if (percentage > 15) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getResolutionStatus = (rate: number) => {
    if (rate >= 80) return { color: 'text-green-600', status: 'Excellent', bg: 'bg-green-100' };
    if (rate >= 60) return { color: 'text-blue-600', status: 'Good', bg: 'bg-blue-100' };
    if (rate >= 40) return { color: 'text-amber-600', status: 'Needs Improvement', bg: 'bg-amber-100' };
    return { color: 'text-red-600', status: 'Critical', bg: 'bg-red-100' };
  };

  const resolutionStatus = getResolutionStatus(data.resolution_rate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Issue Management Overview</h3>
        <p className="text-sm text-slate-600">Track and resolve quality and delivery issues</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Total Issues</p>
          <p className="text-2xl font-bold text-slate-900">{data.total_issues}</p>
        </div>
        <div className={`${resolutionStatus.bg} rounded-lg p-4`}>
          <p className="text-xs text-slate-500 mb-1">Resolution Rate</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-2xl font-bold ${resolutionStatus.color}`}>
              {data.resolution_rate}%
            </p>
            <span className={`text-xs font-medium ${resolutionStatus.color}`}>
              {resolutionStatus.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-slate-700">Resolved Issues</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">{data.resolved_issues}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm text-slate-700">Open Issues</span>
          </div>
          <span className="text-sm font-semibold text-amber-600">{data.open_issues}</span>
        </div>

        <div className="pt-3 space-y-2">
          <p className="text-xs font-medium text-slate-700 mb-2">Severity Breakdown:</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${getSeverityColor(data.critical_issues, data.total_issues)}`}>
              Critical
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(data.critical_issues / data.total_issues) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-900 w-8 text-right">
                {data.critical_issues}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs ${getSeverityColor(data.major_issues, data.total_issues)}`}>
              Major
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(data.major_issues / data.total_issues) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-900 w-8 text-right">
                {data.major_issues}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Minor</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(data.minor_issues / data.total_issues) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-900 w-8 text-right">
                {data.minor_issues}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Recommendation:</span> {
            data.critical_issues > 0
              ? `${data.critical_issues} critical issues require immediate attention`
              : data.open_issues > data.resolved_issues
              ? 'Focus on resolving open issues to improve resolution rate'
              : data.resolution_rate >= 80
              ? 'Excellent issue management - maintain current processes'
              : 'Increase focus on issue resolution to improve quality metrics'
          }
        </p>
      </div>
    </motion.div>
  );
}
