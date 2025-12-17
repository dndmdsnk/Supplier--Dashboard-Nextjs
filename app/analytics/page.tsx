'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import Navbar from '@/components/Navbar';
import AnimatedStatCard from '@/components/AnimatedStatCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import StatusDistributionChart from '@/components/charts/StatusDistributionChart';
import WeeklyActivityChart from '@/components/charts/WeeklyActivityChart';
import IssueMetricsCard from '@/components/charts/IssueMetricsCard';
import EfficiencyChart from '@/components/charts/EfficiencyChart';
import BusinessInsights from '@/components/BusinessInsights';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    summary,
    monthlyTrends,
    statusDistribution,
    issueMetrics,
    weeklyActivity,
    loading,
    error,
  } = useAnalytics();

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Analytics</h1>
          <p className="text-slate-600 text-lg">
            Comprehensive business insights and performance metrics
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
          >
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <SkeletonLoader variant="stats" count={4} className="mb-8" />
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <AnimatedStatCard
                label="Total Contracts"
                value={summary.total_contracts}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color="blue"
                delay={0}
              />
              <AnimatedStatCard
                label="Items Shipped"
                value={summary.total_items_shipped.toLocaleString()}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                }
                color="green"
                delay={0.1}
              />
              <AnimatedStatCard
                label="Total Weight"
                value={Math.round(summary.total_weight_shipped)}
                unit="kg"
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                }
                color="amber"
                delay={0.2}
              />
              <AnimatedStatCard
                label="Avg Weight/Contract"
                value={Math.round(summary.avg_weight_per_contract)}
                unit="kg"
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                }
                color="blue"
                delay={0.3}
              />
              <AnimatedStatCard
                label="Avg Items/Box"
                value={Math.round(summary.avg_items_per_box)}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                }
                color="green"
                delay={0.4}
              />
            </div>

            <div className="mb-8">
              <BusinessInsights summary={summary} issueMetrics={issueMetrics} />
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Performance Trends</h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-2 bg-slate-100 rounded-lg p-1"
                >
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === 'line'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Line Chart
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === 'bar'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bar Chart
                  </button>
                </motion.div>
              </div>
              <MonthlyTrendChart data={monthlyTrends} type={chartType} />
            </div>

            <div className="mb-8">
              <EfficiencyChart
                totalItems={summary.total_items_shipped}
                totalWeight={summary.total_weight_shipped}
                avgItemsPerBox={summary.avg_items_per_box}
                avgWeightPerContract={summary.avg_weight_per_contract}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <StatusDistributionChart data={statusDistribution} />
              <IssueMetricsCard data={issueMetrics} />
            </div>

            <WeeklyActivityChart data={weeklyActivity} />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">No analytics data available yet.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
