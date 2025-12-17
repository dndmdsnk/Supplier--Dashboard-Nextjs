'use client';

import { motion } from 'framer-motion';
import { AnalyticsSummary, IssueMetrics } from '@/lib/hooks/useAnalytics';

interface BusinessInsightsProps {
  summary: AnalyticsSummary;
  issueMetrics: IssueMetrics | null;
}

interface Insight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  recommendation: string;
  icon: React.ReactNode;
}

export default function BusinessInsights({ summary, issueMetrics }: BusinessInsightsProps) {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    const completionRate = summary.total_contracts > 0
      ? (summary.delivered_contracts / summary.total_contracts) * 100
      : 0;

    const cancellationRate = summary.total_contracts > 0
      ? (summary.cancelled_contracts / summary.total_contracts) * 100
      : 0;

    const activeRate = summary.total_contracts > 0
      ? (summary.active_contracts / summary.total_contracts) * 100
      : 0;

    if (completionRate >= 70) {
      insights.push({
        type: 'success',
        title: 'Excellent Delivery Performance',
        description: `${completionRate.toFixed(0)}% completion rate demonstrates strong operational efficiency and reliable supply chain execution.`,
        recommendation: 'Maintain current processes and consider documenting best practices for scaling.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      });
    } else if (completionRate < 40) {
      insights.push({
        type: 'danger',
        title: 'Low Completion Rate Alert',
        description: `Only ${completionRate.toFixed(0)}% of contracts have been delivered. This indicates significant operational bottlenecks.`,
        recommendation: 'Conduct root cause analysis on delayed contracts. Review supplier capacity and streamline approval processes.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
      });
    }

    if (cancellationRate > 15) {
      insights.push({
        type: 'warning',
        title: 'High Cancellation Rate',
        description: `${cancellationRate.toFixed(0)}% of contracts are being cancelled, representing potential revenue loss and inefficiency.`,
        recommendation: 'Investigate cancellation reasons. Consider implementing stricter contract validation and supplier vetting.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
          </svg>
        ),
      });
    }

    if (activeRate > 50) {
      insights.push({
        type: 'info',
        title: 'High Pipeline Volume',
        description: `${activeRate.toFixed(0)}% of contracts are currently active, indicating strong business pipeline and growth.`,
        recommendation: 'Ensure adequate resources are allocated to handle the volume. Monitor progress metrics closely.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
      });
    }

    if (summary.avg_weight_per_contract > 1000) {
      insights.push({
        type: 'info',
        title: 'Heavy Shipment Profile',
        description: `Average shipment weight of ${summary.avg_weight_per_contract.toFixed(0)}kg per contract indicates bulk operations.`,
        recommendation: 'Optimize logistics partnerships for heavy freight. Consider negotiating volume-based shipping rates.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        ),
      });
    }

    if (issueMetrics && issueMetrics.critical_issues > 0) {
      insights.push({
        type: 'danger',
        title: 'Critical Issues Detected',
        description: `${issueMetrics.critical_issues} critical issues require immediate attention to prevent delivery delays.`,
        recommendation: 'Prioritize critical issue resolution. Assign dedicated resources and establish escalation protocols.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
      });
    }

    if (issueMetrics && issueMetrics.resolution_rate >= 80) {
      insights.push({
        type: 'success',
        title: 'Strong Issue Resolution',
        description: `${issueMetrics.resolution_rate}% resolution rate shows effective quality management and problem-solving capabilities.`,
        recommendation: 'Continue current issue management practices. Consider sharing learnings with the team.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      });
    }

    if (summary.total_items_shipped > 10000) {
      insights.push({
        type: 'success',
        title: 'High Volume Operations',
        description: `${summary.total_items_shipped.toLocaleString()} items shipped demonstrates scale and operational maturity.`,
        recommendation: 'Leverage volume for better supplier negotiations. Consider automation investments for continued growth.',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        ),
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const typeColors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      title: 'text-green-900',
      text: 'text-green-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      title: 'text-amber-900',
      text: 'text-amber-700',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      title: 'text-red-900',
      text: 'text-red-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-700',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-4"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Business Intelligence Insights</h2>
        <p className="text-sm text-slate-600">AI-powered analysis with actionable recommendations</p>
      </div>

      {insights.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">Generating insights based on your data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const colors = typeColors[insight.type];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className={`${colors.bg} ${colors.border} border rounded-xl p-4`}
              >
                <div className="flex gap-3">
                  <div className={`${colors.icon} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${colors.title} mb-2`}>{insight.title}</h4>
                    <p className={`text-sm ${colors.text} mb-3`}>{insight.description}</p>
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-1">Recommendation:</p>
                      <p className="text-xs text-slate-600">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
